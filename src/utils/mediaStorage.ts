/**
 * IndexedDB Media Storage Abstraction
 * Stores binary file blobs safely in browser IndexedDB while keeping
 * lightweight metadata in AppState, resolving object URLs dynamically.
 */

const DB_NAME = 'creator_lab_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_blobs';

// In-memory cache of resolved Object URLs to avoid duplicate memory allocation
const runtimeUrlCache = new Map<string, string>();

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a Blob or File to IndexedDB associated with an asset ID
 */
export async function saveMediaBlob(id: string, file: Blob | File): Promise<void> {
  const db = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put({ id, blob: file, timestamp: Date.now() });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error || new Error('Failed to store media blob'));
    tx.onabort = () => reject(tx.error || new Error('Media storage transaction aborted'));
  });

  const previousUrl = runtimeUrlCache.get(id);
  if (previousUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(previousUrl);
  }
  runtimeUrlCache.set(id, URL.createObjectURL(file));
}

/**
 * Get a stored Blob from IndexedDB
 */
export async function getMediaBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.blob : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to retrieve media blob from IndexedDB:', err);
    return null;
  }
}

/**
 * Delete a media blob from IndexedDB and revoke its runtime URL
 */
export async function deleteMediaBlob(id: string): Promise<void> {
  const cachedUrl = runtimeUrlCache.get(id);
  if (cachedUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(cachedUrl);
    runtimeUrlCache.delete(id);
  }

  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error || new Error('Failed to delete media blob'));
    tx.onabort = () => reject(tx.error || new Error('Media delete transaction aborted'));
  });
}

/**
 * Resolve an active runtime URL for an asset:
 * If it's already an http(s) URL (like Unsplash seed data), return it as is.
 * If it's stored in IndexedDB, returns or generates a fresh Blob URL.
 */
export async function resolveMediaUrl(id: string, fallbackUrl?: string): Promise<string> {
  if (fallbackUrl && (fallbackUrl.startsWith('http://') || fallbackUrl.startsWith('https://') || fallbackUrl.startsWith('data:'))) {
    return fallbackUrl;
  }

  if (runtimeUrlCache.has(id)) {
    return runtimeUrlCache.get(id)!;
  }

  const blob = await getMediaBlob(id);
  if (blob) {
    const url = URL.createObjectURL(blob);
    runtimeUrlCache.set(id, url);
    return url;
  }

  return fallbackUrl || '';
}

/**
 * Cleanup function to revoke all cached object URLs on app unmount
 */
export function revokeAllMediaUrls(): void {
  runtimeUrlCache.forEach((url) => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
  runtimeUrlCache.clear();
}
