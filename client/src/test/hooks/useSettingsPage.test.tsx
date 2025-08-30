import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { AlertProvider } from '@/components/AlertProvider'
import useSettingsPage from '@/pages/settings/hooks/useSettingsPage'

// Wrapper to provide Alert context required by the hook
const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AlertProvider>{children}</AlertProvider>
)

describe('useSettingsPage', () => {
  it('başlangıç durumlarını doğru initialize etmeli', () => {
    const { result } = renderHook(() => useSettingsPage(), { wrapper: Wrapper })

    expect(result.current.posConfig.type).toBe('Ingenico')
    expect(result.current.barcodeConfig.type).toBe('USB HID')
    expect(result.current.receiptConfig.storeName).toBe('')
    expect(result.current.connectionStatus).toBe('unknown')
    expect(result.current.backups.length).toBe(0)
    expect(result.current.saveStatus.status).toBe('idle')
  })

  it('POS bağlantı testini başarıyla simüle etmeli', () => {
    const { result } = renderHook(() => useSettingsPage(), { wrapper: Wrapper })

    act(() => {
      result.current.onTestConnection()
    })

    expect(result.current.connectionStatus).toBe('connected')
  })

  it('Kaydet işlemi ortak saveStatus ile başarılı olmalı (POS)', () => {
    const { result } = renderHook(() => useSettingsPage(), { wrapper: Wrapper })

    act(() => {
      result.current.onSavePOS()
    })

    expect(result.current.saveStatus.status).toBe('saved')
    expect(result.current.saveStatus.message).toContain('POS')
  })

  it('Yedek oluşturma akışını simüle etmeli', () => {
    const { result } = renderHook(() => useSettingsPage(), { wrapper: Wrapper })

    // Klasör seçimi
    act(() => {
      result.current.onSelectBackupDirectory()
    })

    // Yol beklenen placeholder (tam eşleşme yerine içerik kontrolü)
    expect(result.current.backupDirectory).toContain('RoxoePOS')

    // Yedek oluştur
    act(() => {
      result.current.onCreateBackup()
    })

    expect(result.current.backups.length).toBeGreaterThan(0)
    expect(result.current.backupSchedule.lastBackup).not.toBeNull()
  })

  it('Serial aktivasyon validasyonunu ve başarı akışını yönetmeli', () => {
    const { result } = renderHook(() => useSettingsPage(), { wrapper: Wrapper })

    // Geçersiz (boş) serial ile hata vermeli
    act(() => {
      result.current.onActivateSerial()
    })
    expect(result.current.serialStatus.error).toBeTruthy()

    // Geçerli 12 haneli serial ile aktivasyon
    act(() => {
      result.current.setNewSerialNo('ABCD1234EFGH')
    })
    act(() => {
      result.current.onActivateSerial()
    })

    expect(result.current.serialInfo).not.toBeNull()
    expect(result.current.serialInfo?.isActive).toBe(true)
    expect(result.current.newSerialNo).toBe('')
  })

  it('Barkod ve Fiş ayarlarını güncellemeli', () => {
    const { result } = renderHook(() => useSettingsPage(), { wrapper: Wrapper })

    act(() => {
      result.current.setBarcodeConfig({ ...result.current.barcodeConfig, type: 'Serial' })
    })
    expect(result.current.barcodeConfig.type).toBe('Serial')

    act(() => {
      result.current.setReceiptConfig({ ...result.current.receiptConfig, storeName: 'Test Mağaza' })
    })
    expect(result.current.receiptConfig.storeName).toBe('Test Mağaza')
  })
})

