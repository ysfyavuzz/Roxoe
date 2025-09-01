import { describe, expect, it } from 'vitest'

import { productService, resetDatabases } from '../services/productDB'
import { cashRegisterService } from '../services/cashRegisterDB'
import { creditService } from '../services/creditServices'
import { salesDB } from '../services/salesDB'
import { Product } from '../types/product'
import { CashRegisterStatus } from '../types/cashRegister'
import { calculateCartItemTotals, calculateCartTotals } from '../utils/vatUtils'

function pWithVat(salePrice: number, vatRate: number): number {
  return Number((salePrice * (1 + vatRate / 100)).toFixed(2))
}

async function safeAddCategory(name: string) {
  try {
    await productService.addCategory({ name })
  } catch (e) {
    // ignore duplicates
  }
}

async function seedTekelStock() {
  // Kategoriler
  const categories = [
    'Sigara',
    'Bira',
    'Rakı',
    'Vodka',
    'Viski',
    'Şarap',
    'Atıştırmalık',
    'İçecek',
  ]
  for (const c of categories) {
    await safeAddCategory(c)
  }

  // Ürünler (örnek)
  const vat = 20 as const
  const items: Omit<Product, 'id'>[] = [
    { name: 'Marlboro Red 20', purchasePrice: 55, salePrice: 60, vatRate: vat, priceWithVat: pWithVat(60, vat), category: 'Sigara', stock: 100, barcode: 'SIG-001' },
    { name: 'Parliament 20', purchasePrice: 54, salePrice: 59, vatRate: vat, priceWithVat: pWithVat(59, vat), category: 'Sigara', stock: 80, barcode: 'SIG-002' },
    { name: 'Efes Pilsen 50cl', purchasePrice: 23, salePrice: 28, vatRate: vat, priceWithVat: pWithVat(28, vat), category: 'Bira', stock: 120, barcode: 'BIR-001' },
    { name: 'Tuborg Gold 50cl', purchasePrice: 22, salePrice: 27, vatRate: vat, priceWithVat: pWithVat(27, vat), category: 'Bira', stock: 110, barcode: 'BIR-002' },
    { name: 'Yeni Rakı 70cl', purchasePrice: 450, salePrice: 520, vatRate: vat, priceWithVat: pWithVat(520, vat), category: 'Rakı', stock: 25, barcode: 'RAK-070' },
    { name: 'Absolut 70cl', purchasePrice: 380, salePrice: 460, vatRate: vat, priceWithVat: pWithVat(460, vat), category: 'Vodka', stock: 18, barcode: 'VDK-070' },
    { name: 'Jack Daniel\'s 70cl', purchasePrice: 900, salePrice: 1050, vatRate: vat, priceWithVat: pWithVat(1050, vat), category: 'Viski', stock: 12, barcode: 'WSK-070' },
    { name: 'Villa Doluca Kırmızı 75cl', purchasePrice: 140, salePrice: 175, vatRate: vat, priceWithVat: pWithVat(175, vat), category: 'Şarap', stock: 30, barcode: 'SRP-075' },
    { name: 'Doritos Nacho 107g', purchasePrice: 15, salePrice: 22, vatRate: vat, priceWithVat: pWithVat(22, vat), category: 'Atıştırmalık', stock: 60, barcode: 'SNK-001' },
    { name: 'Coca-Cola 1L', purchasePrice: 12, salePrice: 17, vatRate: vat, priceWithVat: pWithVat(17, vat), category: 'İçecek', stock: 70, barcode: 'DRK-CC1' },
    { name: 'Red Bull 250ml', purchasePrice: 18, salePrice: 25, vatRate: vat, priceWithVat: pWithVat(25, vat), category: 'İçecek', stock: 50, barcode: 'DRK-RB250' },
  ]

  await productService.bulkInsertProducts(items as Product[])
}

async function seedCustomers() {
  const ali = await creditService.addCustomer({
    name: 'Ali Demir',
    phone: '5551112233',
    address: 'Yıldız Mh. 1. Sk. No:5',
    creditLimit: 2000,
    note: 'Mahalle sakini'
  })
  const ayse = await creditService.addCustomer({
    name: 'Ayşe Çelik',
    phone: '5554445566',
    address: 'Güneş Mh. 2. Sk. No:12',
    creditLimit: 1500,
    note: 'Sık müşteri'
  })
  return { ali, ayse }
}

describe('[scenario] Tekel bayi: stok, veresiye ve satış akışı', () => {
  it('stok oluşturur, müşterileri ekler ve nakit + veresiye satış yapar', async () => {
    // Temiz başlangıç
    await resetDatabases()

    // Stok ve müşteriler
    await seedTekelStock()
    const { ali } = await seedCustomers()

    // Kasayı aç
    const opening = await cashRegisterService.openRegister(500)
    expect(opening.status).toBe(CashRegisterStatus.OPEN)

    // Ürünleri al ve iki farklı sepet hazırla
    const all = await productService.getAllProducts()
    expect(all.length).toBeGreaterThan(5)

    function pickByBarcode(bc: string) {
      const p = all.find(x => x.barcode === bc)
  if (!p) {
        throw new Error('Ürün bulunamadı: ' + bc)
      }
      return p
    }

    // 1) Nakit satış: Marlboro x2 + Efes x3
    const marlboro = pickByBarcode('SIG-001')
    const efes = pickByBarcode('BIR-001')

    const cartCash = [
      { ...marlboro, quantity: 2 },
      { ...efes, quantity: 3 },
    ]
    const cashTotals = calculateCartTotals(cartCash as any)

    // Sale kaydı
    const cashSale = await salesDB.addSale({
      items: cartCash.map(i => calculateCartItemTotals(i as any) as any),
      subtotal: cashTotals.subtotal,
      vatAmount: cashTotals.vatAmount,
      total: cashTotals.total,
      paymentMethod: 'nakit',
      date: new Date(),
      status: 'completed',
      receiptNo: salesDB.generateReceiptNo(),
    })
    expect(cashSale.total).toBeGreaterThan(0)

    // Kasa güncelle ve stok düş
    await cashRegisterService.recordSale(cashTotals.total, 0)
    for (const item of cartCash) {
      await productService.updateStock(item.id, -item.quantity)
    }

    // 2) Veresiye satış: Yeni Rakı x1 + Doritos x2 (Ali Demir)
    const raki = pickByBarcode('RAK-070')
    const doritos = pickByBarcode('SNK-001')

    const cartCredit = [
      { ...raki, quantity: 1 },
      { ...doritos, quantity: 2 },
    ]
    const creditTotals = calculateCartTotals(cartCredit as any)

    const creditSale = await salesDB.addSale({
      items: cartCredit.map(i => calculateCartItemTotals(i as any) as any),
      subtotal: creditTotals.subtotal,
      vatAmount: creditTotals.vatAmount,
      total: creditTotals.total,
      paymentMethod: 'veresiye',
      date: new Date(),
      status: 'completed',
      receiptNo: salesDB.generateReceiptNo(),
    })
    expect(creditSale.total).toBeGreaterThan(0)

    // Veresiye borç işlemi ve stok düş
    await creditService.addTransaction({
      customerId: ali.id,
      type: 'debt',
      amount: creditTotals.total,
      date: new Date(),
      description: `Fiş No: ${creditSale.receiptNo}`,
    })
    for (const item of cartCredit) {
      await productService.updateStock(item.id, -item.quantity)
    }

    // Doğrulamalar
    const session = await cashRegisterService.getActiveSession()
    expect(session).not.toBeNull()
    // Nakit satış kasa nakit kısmına yazılmış olmalı
    expect((session as any).cashSalesTotal).toBeGreaterThanOrEqual(cashTotals.total)

    const aliAfter = await creditService.getCustomerById(ali.id)
    expect(aliAfter?.currentDebt).toBeGreaterThanOrEqual(creditTotals.total)

    const allAfter = await productService.getAllProducts()
    const marlboroAfter = allAfter.find(p => p.barcode === 'SIG-001')!
    const efesAfter = allAfter.find(p => p.barcode === 'BIR-001')!
    const rakiAfter = allAfter.find(p => p.barcode === 'RAK-070')!
    const doritosAfter = allAfter.find(p => p.barcode === 'SNK-001')!

    expect(marlboroAfter.stock).toBe(marlboro.stock - 2)
    expect(efesAfter.stock).toBe(efes.stock - 3)
    expect(rakiAfter.stock).toBe(raki.stock - 1)
    expect(doritosAfter.stock).toBe(doritos.stock - 2)

    const sales = await salesDB.getAllSales()
    expect(sales.length).toBeGreaterThanOrEqual(2)
  })
})
