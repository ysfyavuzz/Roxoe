import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'your-secret-key';

export const encryptionService = {
  encrypt(data: unknown): string {
    return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
  },

  decrypt<T = unknown>(encryptedData: string): T {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8)) as T;
  }
};
