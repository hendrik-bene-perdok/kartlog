/**
 * IndexedDB Initialization for Photo Storage
 * Feature: 004-maintenance-core
 * 
 * Manages photo storage in IndexedDB to avoid Firestore quota issues
 */

const DB_NAME = 'kartlog-photos';
const STORE_NAME = 'photos';
const DB_VERSION = 1;

/**
 * Open IndexedDB database for photo storage
 * 
 * Creates object store if it doesn't exist
 * @returns Promise<IDBDatabase>
 */
export function openPhotosDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('IndexedDB only available in browser'));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // Create object store if it doesn't exist
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
}

/**
 * Get the photos object store
 * 
 * @param mode - 'readonly' or 'readwrite'
 * @returns Promise<IDBObjectStore>
 */
export async function getPhotosStore(mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    const db = await openPhotosDB();
    const transaction = db.transaction(STORE_NAME, mode);
    return transaction.objectStore(STORE_NAME);
}

/**
 * Close IndexedDB connection
 * 
 * @param db - Database instance to close
 */
export function closeDB(db: IDBDatabase): void {
    db.close();
}

export { DB_NAME, STORE_NAME };
