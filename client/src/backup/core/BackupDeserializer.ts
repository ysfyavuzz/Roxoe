/**
 * .roxoe dosyasını veri yapısına dönüştürecek modül
 */

import { ChecksumUtils } from "../utils/checksumUtils";
import { CompressionUtils } from "../utils/compressionUtils";

import { BackupMetadata } from "./BackupSerializer";

export interface DeserializedBackup {
  metadata: BackupMetadata;
  data: unknown;
  isValid: boolean;
  error?: string;
}

export class BackupDeserializer {
  /**
   * .roxoe formatından veriyi çözümler
   *
   * @param backupContent .roxoe formatında veri
   * @returns Çözümlenmiş veri ve meta bilgileri
   */
  deserializeFromRoxoeFormat(backupContent: string): DeserializedBackup {
    try {
      // Meta veri uzunluğunu oku (ilk 4 byte)
      const metaLengthBytes = new Uint8Array(4);
      for (let i = 0; i < 4; i++) {
        metaLengthBytes[i] = backupContent.charCodeAt(i);
      }

      const metaLength =
        (metaLengthBytes[0] ?? 0) |
        ((metaLengthBytes[1] ?? 0) << 8) |
        ((metaLengthBytes[2] ?? 0) << 16) |
        ((metaLengthBytes[3] ?? 0) << 24);

      // Meta verileri oku
      const metaJson = backupContent.substring(4, 4 + metaLength);
      const metadata = JSON.parse(metaJson) as BackupMetadata;

      // Sıkıştırılmış veriyi oku
      const compressedData = backupContent.substring(4 + metaLength);

      // Veri bütünlüğünü kontrol et
      if (metadata.checksum) {
        const calculatedChecksum =
          ChecksumUtils.calculateSHA256(compressedData);
        if (calculatedChecksum !== metadata.checksum) {
          return {
            metadata,
            data: null,
            isValid: false,
            error: "Veri bütünlüğü doğrulanamadı: Checksum eşleşmiyor",
          };
        }
      }

      // Sıkıştırılmış veriyi aç
      const jsonData = CompressionUtils.decompress(compressedData);

      // JSON veriyi parse et
      const rawData = JSON.parse(jsonData);

      // Date nesnelerini restore et
      const data = this.restoreDataFromBackup(rawData);

      console.log("Veri geri yüklendi, Date nesneleri dönüştürüldü");

      return {
        metadata,
        data,
        isValid: true,
      };
    } catch (error) {
      console.error("Yedek çözümleme hatası:", error);
      return {
        metadata: {} as BackupMetadata,
        data: null,
        isValid: false,
        error: `Yedek çözümleme hatası: ${(error as Error).message}`,
      };
    }
  }

  /**
   * JSON string'i parse eder ve ISO tarih formatında olan alanları Date objelerine dönüştürür
   */
  private parseWithDateReviver(jsonString: string): unknown {
    return JSON.parse(jsonString, (key, value) => {
      // ISO tarih formatını kontrol et
      if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(value)
      ) {
        return new Date(value);
      }
      return value;
    });
  }

  /**
   * Özel işaretlenmiş Date nesnelerini geri yükler
   */
  private restoreDataFromBackup(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    // Özel tarih nesnesini kontrol et (format: { __isDate: true, value: "ISO-string" })
    if (typeof data === "object") {
      const marker = data as { __isDate?: unknown; value?: unknown };
      if (marker.__isDate === true && typeof marker.value === "string") {
        try {
          const date = new Date(marker.value);
          // Debug için log
          console.log(`Tarih dönüştürüldü: ${marker.value} -> ${date}`);
          return date;
        } catch (e) {
          console.error(`Tarih dönüştürme hatası:`, e, data);
          return new Date(); // Fallback - geçerli tarih döndür
        }
      }
    }

    // Dizi kontrolü
    if (Array.isArray(data)) {
      return (data as unknown[]).map((item) => this.restoreDataFromBackup(item));
    }

    // Nesne kontrolü
    if (typeof data === "object") {
      const src = data as Record<string, unknown>;
      const result: Record<string, unknown> = {};
      for (const key in src) {
        if (Object.prototype.hasOwnProperty.call(src, key)) {
          result[key] = this.restoreDataFromBackup(src[key]);
        }
      }
      return result;
    }

    // Diğer tip değerleri doğrudan döndür
    return data;
  }

  /**
   * Sıkıştırılmış veriyi açar
   */
  decompressData(compressedData: string): string {
    return CompressionUtils.decompress(compressedData);
  }

  /**
   * Veri bütünlüğünü kontrol eder
   */
  verifyChecksum(data: string, expectedChecksum: string): boolean {
    return ChecksumUtils.verifyChecksum(data, expectedChecksum);
  }
}
