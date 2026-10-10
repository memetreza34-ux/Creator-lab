import assert from 'node:assert/strict';
import test from 'node:test';
import {
  deleteMediaBlob,
  resolveMediaUrl,
  revokeAllMediaUrls,
  saveMediaBlob,
} from './mediaStorage';

type FakeRequest = {
  onsuccess: (() => void) | null;
  onerror: (() => void) | null;
  error: Error | null;
};

type FakeTransaction = {
  oncomplete: (() => void) | null;
  onerror: (() => void) | null;
  onabort: (() => void) | null;
  error: Error | null;
  request: FakeRequest;
  objectStore: () => {
    put: () => FakeRequest;
    delete: () => FakeRequest;
  };
};

function installIndexedDbFixture() {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'indexedDB');
  const transactions: FakeTransaction[] = [];

  const db = {
    transaction: () => {
      const request: FakeRequest = { onsuccess: null, onerror: null, error: null };
      const tx: FakeTransaction = {
        oncomplete: null,
        onerror: null,
        onabort: null,
        error: null,
        request,
        objectStore: () => ({
          put: () => request,
          delete: () => request,
        }),
      };
      transactions.push(tx);
      return tx;
    },
  };

  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: {
      open: () => {
        const request = {
          result: db,
          onsuccess: null as (() => void) | null,
          onerror: null as (() => void) | null,
          onupgradeneeded: null as (() => void) | null,
          error: null,
        };
        queueMicrotask(() => request.onsuccess?.());
        return request;
      },
    },
  });

  return {
    async transaction(index: number): Promise<FakeTransaction> {
      for (let i = 0; i < 20; i += 1) {
        if (transactions[index]) return transactions[index];
        await Promise.resolve();
      }
      throw new Error('Expected IndexedDB transaction was not created');
    },
    restore() {
      if (previous) {
        Object.defineProperty(globalThis, 'indexedDB', previous);
      } else {
        Reflect.deleteProperty(globalThis, 'indexedDB');
      }
    },
  };
}

test('media upload rejects aborted transaction even when put request succeeded', async () => {
  const fixture = installIndexedDbFixture();
  try {
    const saving = saveMediaBlob('aborted-upload', new Blob(['media']));
    const tx = await fixture.transaction(0);
    assert.equal(typeof tx.oncomplete, 'function');
    tx.request.onsuccess?.();
    tx.error = new Error('disk full');
    tx.onabort?.();
    await assert.rejects(saving, /disk full/);
  } finally {
    revokeAllMediaUrls();
    fixture.restore();
  }
});

test('media URL is revoked only after delete transaction commits', async () => {
  const fixture = installIndexedDbFixture();
  const originalRevoke = URL.revokeObjectURL;
  const revoked: string[] = [];
  URL.revokeObjectURL = (url: string) => {
    revoked.push(url);
    originalRevoke.call(URL, url);
  };

  try {
    const saving = saveMediaBlob('asset-committed', new Blob(['media']));
    const write = await fixture.transaction(0);
    let saveResolved = false;
    void saving.then(() => { saveResolved = true; });
    write.request.onsuccess?.();
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(saveResolved, false, 'put request success must not finish the upload');
    write.oncomplete?.();
    await saving;
    assert.equal(saveResolved, true);

    const preview = await resolveMediaUrl('asset-committed');
    assert.match(preview, /^blob:/);

    const firstDelete = deleteMediaBlob('asset-committed');
    const rolledBack = await fixture.transaction(1);
    rolledBack.error = new Error('rollback');
    rolledBack.onabort?.();
    await assert.rejects(firstDelete, /rollback/);
    assert.deepEqual(revoked, [], 'aborted deletion must preserve existing URL');
    assert.equal(await resolveMediaUrl('asset-committed'), preview);

    const secondDelete = deleteMediaBlob('asset-committed');
    const committed = await fixture.transaction(2);
    committed.oncomplete?.();
    await secondDelete;
    assert.deepEqual(revoked, [preview]);
  } finally {
    revokeAllMediaUrls();
    URL.revokeObjectURL = originalRevoke;
    fixture.restore();
  }
});
