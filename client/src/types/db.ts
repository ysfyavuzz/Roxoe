import type { DBSchema } from 'idb';

import type {
  CashRegisterSession,
  CashTransaction,
  CashRegisterStatus,
} from './cashRegister';
import type { Product, Category } from './product';

// PosDB için güçlü tipli IndexedDB şeması
export interface PosDBSchema extends DBSchema {
  products: {
    key: number;
    value: Product;
    indexes: {
      barcode: string;
    };
  };
  categories: {
    key: number;
    value: Category;
  };
  productGroups: {
    key: number;
    value: { id: number; name: string; order: number; isDefault?: boolean };
    indexes: {
      order: number;
    };
  };
  productGroupRelations: {
    key: [number, number];
    value: { groupId: number; productId: number };
    indexes: {
      groupId: number;
      productId: number;
    };
  };
  cashRegisterSessions: {
    key: string;
    value: CashRegisterSession;
    indexes: {
      status: CashRegisterStatus;
    };
  };
  cashTransactions: {
    key: string;
    value: CashTransaction;
    indexes: {
      sessionId: string;
    };
  };
}

