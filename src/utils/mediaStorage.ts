/**
 * Browser-local IndexedDB media storage.
 *
 * Binary media is stored in IndexedDB. Object URLs are runtime-only references
 * and must never be treated as durable metadata.
 */

const DB_NAME = 'creator_lab_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_blobs';

const runtimeUrlCache = new Map<string, string>();

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error('Failed to open IndexedDB media store'));
  });
}

function replaceCachedUrl(id: string, blob: Blob): string {
  const previousUrl = runtimeUrlCache.get(id);
  if (previousUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(previousUrl);
  }

  const url = URL.createObjectURL(blob);
  runtimeUrlCache.set(id, url);
  return url;
}

export async function saveMediaBlob(
  id: string,
  file: Blob | File,
): Promise<string> {
  const db = await openDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      store.put({ id, blob: file, timestamp: Date.now() });

      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject(tx.error || new Error('Failed to save media blob'));
      tx.onabort = () =>
        reject(tx.error || new Error('Media blob transaction was aborted'));
    });

    return replaceCachedUrl(id, file);
  } finally {
    db.close();
  }
}

export async function getMediaBlob(id: string): Promise<Blob | null> {
  const db = await openDatabase();

  try {
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(id);

      request.onsuccess = () => {
        const result = request.result as { blob?: Blob } | undefined;
        resolve(result?.blob || null);
      };
      request.onerror = () =>
        reject(request.error || new Error('Failed to read media blob'));
    });
  } finally {
    db.close();
  }
}

export async function deleteMediaBlob(id: string): Promise<void> {
  const db = await openDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);

      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject(tx.error || new Error('Failed to delete media blob'));
      tx.onabort = () =>
        reject(tx.error || new Error('Media delete transaction was aborted'));
    });
  } finally {
    db.close();
  }

  const cachedUrl = runtimeUrlCache.get(id);
  if (cachedUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(cachedUrl);
  }
  runtimeUrlCache.delete(id);
}

export async function resolveMediaUrl(
  id: string,
  fallbackUrl?: string,
): Promise<string> {
  if (
    fallbackUrl &&
    (fallbackUrl.startsWith('http://') ||
      fallbackUrl.startsWith('https://') ||
      fallbackUrl.startsWith('data:'))
  ) {
    return fallbackUrl;
  }

  const cachedUrl = runtimeUrlCache.get(id);
  if (cachedUrl) return cachedUrl;

  const blob = await getMediaBlob(id);
  if (!blob) return '';

  return replaceCachedUrl(id, blob);
}

export function revokeAllMediaUrls(): void {
  runtimeUrlCache.forEach((url) => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
  runtimeUrlCache.clear();
}
