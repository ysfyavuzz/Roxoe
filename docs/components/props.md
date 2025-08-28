# Kritik Bileşen Props Tabloları

[← Teknik Kitap’a Dön](../ROXOEPOS-TEKNIK-KITAP.md) · [Genel Kitap](../BOOK/ROXOEPOS-KITAP.md)

Aşağıdaki tablolar, sık kullanılan kritik bileşenler için özet props bilgisini sunar. Detaylı imzalar için kaynak dosyalara bakınız.

## PaymentControls
- totalAmount: number (zorunlu)
- originalTotal?: number
- onConfirm: (payment: { method: 'cash'|'card', discount? }) => void (zorunlu)

## POSHeader
- onNewSale: () => void
- onSearchToggle: () => void
- registerStatus: { isOpen: boolean }

## ProductPanel
- onAdd(productId: number): void (zorunlu)
- filters?: { category?: string, groupId?: number }

## CartPanel
- items: Array<{ id, name, qty, priceWithVat }> (zorunlu)
- onQtyChange(id: number, qty: number): void (zorunlu)
- onRemove(id: number): void (zorunlu)

## BackupSettingsTab
- backupDir?: string
- onSelectDir(): Promise<void>
- onSchedule(freq: 'hourly'|'daily'|'weekly', time?): Promise<void>

