/**
 * Büyük veri setleri için bellek-verimli streaming backup serializer
 * Kasma problemlerini çözmek için optimize edilmiştir
 */

import { ChecksumUtils } from '../utils/checksumUtils';
import { CompressionUtils } from '../utils/compressionUtils';

import type { BackupMetadata } from './BackupSerializer';

export interface StreamingSerializeOptions {
  chunkSize?: number;
  onProgress?: (progress: { current: number; total: number; stage: string }) => void;
}

export class StreamingBackupSerializer {
  private defaultChunkSize = 10000; // Karakter başına chunk boyutu

  /**
   * Streaming yaklaşımı ile Roxoe formatına serialize eder
   * Büyük veri setlerinde bellek sorunlarını önler
   */
  async serializeToRoxoeFormatStreaming(
    data: unknown, 
    metadata: Partial<BackupMetadata>, 
    options?: StreamingSerializeOptions
  ): Promise<string> {
    console.log('Streaming serialization başlatılıyor...');
    
    const chunkSize = options?.chunkSize || this.defaultChunkSize;
    
    // Veriyi hazırla
    const preparedData = this.prepareDataForBackup(data);
    
    // JSON string'e dönüştür
    const jsonString = JSON.stringify(preparedData);
    
    if (options?.onProgress) {
      options.onProgress({ current: 25, total: 100, stage: 'JSON serileştirme tamamlandı' });
    }

    // Büyük veri setleri için chunk'lı sıkıştırma
    let compressedData: string;
    if (jsonString.length > chunkSize * 10) {
      console.log('Büyük veri seti tespit edildi, chunk\'lı sıkıştırma kullanılıyor...');
      compressedData = await this.compressInChunks(jsonString, chunkSize, options);
    } else {
      console.log('Küçük veri seti, standart sıkıştırma kullanılıyor...');
      compressedData = CompressionUtils.compress(jsonString);
    }

    if (options?.onProgress) {
      options.onProgress({ current: 75, total: 100, stage: 'Sıkıştırma tamamlandı' });
    }

    // Checksum hesapla
    const checksum = await this.calculateChecksumAsync(compressedData);
    
    // Metadata hazırla
    const finalMetadata = {
      ...metadata,
      checksum,
      dataFormat: 'compressed',
      compressionMethod: 'lz-string-chunked'
    };
    
    // Final formatı oluştur
    const metaJson = JSON.stringify(finalMetadata);
    const metaLength = metaJson.length;
    const metaLengthBytes = this.createLengthHeader(metaLength);
    const metaLengthStr = String.fromCharCode.apply(null, Array.from(metaLengthBytes));
    
    if (options?.onProgress) {
      options.onProgress({ current: 100, total: 100, stage: 'Serileştirme tamamlandı' });
    }

    return metaLengthStr + metaJson + compressedData;
  }

  /**
   * Büyük veriyi bellek sorunlarını önlemek için chunk'lar halinde sıkıştırır
   */
  private async compressInChunks(
    data: string, 
    chunkSize: number, 
    options?: StreamingSerializeOptions
  ): Promise<string> {
    const chunks: string[] = [];
    const totalChunks = Math.ceil(data.length / chunkSize);
    
    console.log(`${data.length} karakter ${totalChunks} chunk halinde sıkıştırılıyor...`);
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, data.length);
      const chunk = data.substring(start, end);
      
      // Chunk'ı sıkıştır
      const compressedChunk = CompressionUtils.compress(chunk);
      chunks.push(compressedChunk);
      
      // İlerleme bildir
      if (options?.onProgress) {
        const progress = Math.round(((i + 1) / totalChunks) * 50) + 25; // 25-75% aralığı
        options.onProgress({ 
          current: progress, 
          total: 100, 
          stage: `Chunk sıkıştırılıyor ${i + 1}/${totalChunks}` 
        });
      }
      
      // Periyodik olarak control'u bırak
      if (i % 10 === 0) {
        await this.yield();
      }
    }
    
    // Sıkıştırılmış chunk'ları ayırıcı ile birleştir
    const separator = '|||CHUNK_SEPARATOR|||';
    const combinedChunks = chunks.join(separator);
    
    // Chunk metadata ekle
    const chunkMetadata = {
      isChunked: true,
      chunkCount: chunks.length,
      separator: separator
    };
    
    const metadataString = JSON.stringify(chunkMetadata);
    return `${metadataString.length.toString().padStart(8, '0')}${metadataString}${combinedChunks}`;
  }

  /**
   * UI'yi bloklamayacak şekilde async checksum hesaplar
   */
  private async calculateChecksumAsync(data: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const checksum = ChecksumUtils.calculateSHA256(data);
        resolve(checksum);
      }, 0);
    });
  }

  /**
   * Metadata için uzunluk header'ı oluşturur
   */
  private createLengthHeader(length: number): Uint8Array {
    const bytes = new Uint8Array(4);
    bytes[0] = length & 0xff;
    bytes[1] = (length >> 8) & 0xff;
    bytes[2] = (length >> 16) & 0xff;
    bytes[3] = (length >> 24) & 0xff;
    return bytes;
  }

  /**
   * Date nesneleri ve diğer özel tipleri backup için hazırlar
   */
  private prepareDataForBackup(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }
    
    if (data instanceof Date) {
      return {
        __isDate: true,
        value: data.toISOString()
      };
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.prepareDataForBackup(item));
    }
    
    if (typeof data === 'object') {
      const src = data as Record<string, unknown>;
      const result: Record<string, unknown> = {};
      for (const key in src) {
        if (Object.prototype.hasOwnProperty.call(src, key)) {
          result[key] = this.prepareDataForBackup(src[key]);
        }
      }
      return result;
    }
    
    return data;
  }

  /**
   * UI güncellemelerine izin vermek için control'u bırakır
   */
  private async yield(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }
}