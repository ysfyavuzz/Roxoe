import { openDB } from 'idb';

import DBVersionHelper from '../helpers/DBVersionHelper';

import { encryptionService } from './encryptionService';

export const createEncryptedDB = (dbName: string) => {
  type EncryptedRow = { data: string };
  return {
    async add<T>(storeName: string, data: T) {
      const db = await openDB(dbName, DBVersionHelper.getVersion(dbName), {
        upgrade(db, oldVersion, newVersion) {
          console.log(`Upgrading ${dbName} from ${oldVersion} to ${newVersion}`);
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
            console.log(`Created ${storeName} store`);
          }
        },
      });
      const encryptedData = encryptionService.encrypt(data);
      return db.add(storeName, { data: encryptedData });
    },

    async get<T>(storeName: string, id: number): Promise<T | null> {
      const db = await openDB(dbName, DBVersionHelper.getVersion(dbName));
      const result = (await db.get(storeName, id)) as EncryptedRow | undefined;
      return result ? encryptionService.decrypt<T>(result.data) : null;
    },

    async getAll<T>(storeName: string): Promise<T[]> {
      const db = await openDB(dbName, DBVersionHelper.getVersion(dbName));
      const results = (await db.getAll(storeName)) as EncryptedRow[];
      return results.map(result => encryptionService.decrypt<T>(result.data));
    },

    async put<T>(storeName: string, data: T, id?: number) {
      const db = await openDB(dbName, DBVersionHelper.getVersion(dbName));
      const encryptedData = encryptionService.encrypt(data);
      return db.put(storeName, { data: encryptedData }, id);
    }
  };
};
