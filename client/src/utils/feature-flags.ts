/**
 * Özellik bayrakları yardımcıları
 * Bu dosya, lisans/aktivasyon baypası ve Serial/Lisans UI görünürlüğünü
 * merkezi ve güvenli şekilde yönetmek için yardımcı fonksiyonlar içerir.
 *
 * Notlar:
 * - Yalnızca Vite ile başlayan (VITE_) değişkenler client tarafına taşınır.
 * - BYPASS sadece development/test modlarında etkinleştirilebilir.
 * - Production/Staging ortamlarında BYPASS tespit edilirse uyarı verilir.
 */

/**
 * 'true'/'1' değerlerini boolean true olarak yorumlar.
 * Diğer tüm değerler false kabul edilir.
 */
export function parseBoolean(value: string | undefined): boolean {
  return value === 'true' || value === '1';
}

/**
 * Geçerli build modu development veya test mi?
 */
export function isDevOrTestMode(): boolean {
  const mode = import.meta.env.MODE;
  return mode === 'development' || mode === 'test';
}

/**
 * Lisans/aktivasyon baypasının etkin olup olmadığını döndürür.
 * - Sadece development/test modlarında etkinleştirilmelidir.
 * - Production/Staging için güvenlik amaçlı her zaman false kabul edilir.
 */
export function isLicenseBypassEnabled(): boolean {
  const bypass = parseBoolean(import.meta.env.VITE_LICENSE_BYPASS as any);
  if (!isDevOrTestMode()) {
    // Üretim/stage derlemelerinde BYPASS görürsek dev uyarısı
    if (bypass && typeof console !== 'undefined') {
      console.warn('[Lisans] VITE_LICENSE_BYPASS production/staging ortamında tespit edildi ve yok sayıldı.');
    }
    return false;
  }
  return bypass;
}

/**
 * Serial/Lisans ayarları sekmesinin görünürlüğünü yönetir.
 * - Varsayılan: false (dev/test’te gizli)
 * - Production/Staging: true önerilir.
 */
export function isSerialFeatureEnabled(): boolean {
  return parseBoolean(import.meta.env.VITE_SERIAL_FEATURE as any);
}

