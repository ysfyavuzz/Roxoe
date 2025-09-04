/**
 * Customer Database Service
 * Müşteri veritabanı işlemleri
 */

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  creditLimit: number;
  currentDebt: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerTransaction {
  id: number;
  customerId: number;
  type: 'sale' | 'payment' | 'return';
  amount: number;
  date: string;
  description?: string;
}

export interface CustomerStatistics {
  totalPurchases: number;
  totalPayments: number;
  currentDebt: number;
  transactionCount: number;
  averagePurchase: number;
  lastTransactionDate: string;
  customerSince: string;
  creditUtilization: number;
}

// Mock veri
let customers: Customer[] = [];
let transactions: CustomerTransaction[] = [];

// Müşterileri getir
export async function getCustomers(): Promise<Customer[]> {
  return Promise.resolve(customers);
}

// Müşteri getir
export async function getCustomer(id: number): Promise<Customer | undefined> {
  return Promise.resolve(customers.find(c => c.id === id));
}

// Müşteri ekle
export async function addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
  const existingCustomer = customers.find(c => c.phone === customer.phone);
  if (existingCustomer) {
    throw new Error('Bu telefon numarası zaten kayıtlı');
  }

  const newCustomer: Customer = {
    ...customer,
    id: customers.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  customers.push(newCustomer);
  return Promise.resolve(newCustomer);
}

// Müşteri güncelle
export async function updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer> {
  const index = customers.findIndex(c => c.id === id);
  if (index === -1) {
    throw new Error('Müşteri bulunamadı');
  }

  customers[index] = {
    ...customers[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  return Promise.resolve(customers[index]);
}

// Müşteri sil
export async function deleteCustomer(id: number, softDelete?: boolean): Promise<void> {
  if (softDelete) {
    const customer = customers.find(c => c.id === id);
    if (customer) {
      customer.isActive = false;
    }
  } else {
    customers = customers.filter(c => c.id !== id);
  }
  return Promise.resolve();
}

// Müşteri borcunu güncelle
export async function updateCustomerDebt(id: number, amount: number): Promise<Customer> {
  const customer = customers.find(c => c.id === id);
  if (!customer) {
    throw new Error('Müşteri bulunamadı');
  }

  customer.currentDebt += amount;
  customer.updatedAt = new Date().toISOString();

  // İşlem kaydı ekle
  const transaction: CustomerTransaction = {
    id: transactions.length + 1,
    customerId: id,
    type: amount > 0 ? 'sale' : 'payment',
    amount: Math.abs(amount),
    date: new Date().toISOString()
  };
  transactions.push(transaction);

  return Promise.resolve(customer);
}

// Müşteri işlemlerini getir
export async function getCustomerTransactions(customerId: number): Promise<CustomerTransaction[]> {
  return Promise.resolve(transactions.filter(t => t.customerId === customerId));
}

// Müşteri istatistiklerini getir
export async function getCustomerStatistics(customerId: number): Promise<CustomerStatistics> {
  const customer = customers.find(c => c.id === customerId);
  if (!customer) {
    throw new Error('Müşteri bulunamadı');
  }

  const customerTransactions = transactions.filter(t => t.customerId === customerId);
  const purchases = customerTransactions.filter(t => t.type === 'sale');
  const payments = customerTransactions.filter(t => t.type === 'payment');

  const stats: CustomerStatistics = {
    totalPurchases: purchases.reduce((sum, t) => sum + t.amount, 0),
    totalPayments: payments.reduce((sum, t) => sum + t.amount, 0),
    currentDebt: customer.currentDebt,
    transactionCount: customerTransactions.length,
    averagePurchase: purchases.length ? purchases.reduce((sum, t) => sum + t.amount, 0) / purchases.length : 0,
    lastTransactionDate: customerTransactions.length ? customerTransactions[customerTransactions.length - 1].date : '',
    customerSince: customer.createdAt,
    creditUtilization: customer.creditLimit ? (customer.currentDebt / customer.creditLimit) * 100 : 0
  };

  return Promise.resolve(stats);
}

// Müşteri içe aktarma
export async function importCustomers(data: string, format: 'csv' | 'excel'): Promise<{
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}> {
  // Mock implementation
  return Promise.resolve({
    success: 1,
    failed: 0,
    errors: []
  });
}

// Müşteri dışa aktarma
export async function exportCustomers(format: 'csv' | 'excel' | 'pdf'): Promise<string> {
  // Mock implementation
  return Promise.resolve('exported_data');
}

// Test için reset fonksiyonu
export function resetDatabase() {
  customers = [];
  transactions = [];
}
