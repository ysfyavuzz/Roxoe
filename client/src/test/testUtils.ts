/**
 * Shared test utilities for integration and unit tests
 */

/**
 * Resets an IndexedDB database by deleting it completely
 * @param dbName - Name of the database to reset
 * @returns Promise that resolves when the database is deleted
 */
export async function resetDatabase(dbName: string): Promise<void> {
  try {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(dbName);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => resolve();
    });
  } catch (error) {
    // Silently handle errors - database might not exist
    console.warn(`Failed to reset database ${dbName}:`, error);
  }
}

/**
 * Setup function to ensure fake-indexeddb is properly configured for tests
 * Should be called at the top of test files that use IndexedDB
 */
export function setupTestDatabase(): void {
  if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
    Object.defineProperty(window, 'indexedDB', {
      value: globalThis.indexedDB,
      writable: true,
    });
  }
}
