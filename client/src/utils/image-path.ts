// client/src/utils/image-path.ts

/**
 * Dosya adı üretimi için güvenli dönüştürme yapar.
 * - Küçük harfe çevirir
 * - [a-z0-9-_] dışında kalan karakterleri '-' ile değiştirir
 * - Birden fazla '-' yan yanaysa teke indirger
 * - Baş/sontaki '-' karakterlerini temizler
 * - Windows rezerve adları ile çakışırsa başına 'file-' ekler
 * - 64 karakterden uzunsa keser
 *
 * Örnekler:
 * - "WSK-070" -> "wsk-070"
 * - "COM1" -> "file-com1"
 * - "  123  " -> "123"
 */
export function sanitizeForFileName(input: string): string {
  const lower = String(input || '').toLowerCase().trim();
  // İzin verilmeyen karakterleri '-' yap
  let safe = lower.replace(/[^a-z0-9-_]+/g, '-');
  // Birden fazla '-' yan yana ise teke indir
  safe = safe.replace(/-+/g, '-');
  // Baş/son '-' temizle
  safe = safe.replace(/^-+|-+$/g, '');
  // Uzunluk sınırı
  if (safe.length > 64) {
    safe = safe.slice(0, 64);
  }
  // Windows rezerve adları
  const reserved = new Set([
    'con', 'prn', 'aux', 'nul',
    'com1','com2','com3','com4','com5','com6','com7','com8','com9',
    'lpt1','lpt2','lpt3','lpt4','lpt5','lpt6','lpt7','lpt8','lpt9',
  ]);
  if (reserved.has(safe)) {
    safe = 'file-' + safe;
  }
  // Boş kaldıysa güvenli varsayılan
  if (!safe) {
    safe = 'unnamed';
  }
  return safe;
}

/**
 * Ürün görseli için kullanılacak yolu üretir.
 * - imageUrl varsa (ve boş değilse) öncelikle onu döndürür (mevcut veriyle uyumluluk)
 * - imageUrl yoksa, barkoddan sanitize edilmiş bir dosya adı üretip
 *   public/images/products altında PNG yolu döndürür
 * - Barkod da yoksa undefined döner
 *
 * Not: Bu fonksiyon yalnızca yolu üretir. Gerçek dosyanın varlık kontrolü UI tarafında
 * img onError ile yapılmalı; başarısız olursa placeholder gösterilmelidir.
 */
export function getProductImagePath(barcode?: string, imageUrl?: string): string | undefined {
  const hasImageUrl = typeof imageUrl === 'string' && imageUrl.trim().length > 0;
  if (hasImageUrl) {
    return imageUrl as string;
  }
  const hasBarcode = typeof barcode === 'string' && barcode.trim().length > 0;
  if (!hasBarcode) {
    return undefined;
  }
  const safe = sanitizeForFileName(barcode as string);
  return `/images/products/${safe}.png`;
}

