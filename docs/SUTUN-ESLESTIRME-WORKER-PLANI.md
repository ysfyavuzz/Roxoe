# ColumnMappingModal için Web Worker Planı

[← Teknik Kitap’a Dön](ROXOEPOS-TEKNIK-KITAP.md) · [Genel Kitap](BOOK/ROXOEPOS-KITAP.md)

Amaç
- Büyük Excel/CSV dosyalarının başlık eşleştirme ve satır işleme (parse/normalize/validate) yükünü ana UI iş parçacığından ayırmak.
- UI’nin akıcı kalmasını sağlamak, ilerleme (progress) ve iptal (cancel) desteği eklemek.

Kapsam
- Dosya okuma ve satır bazlı işleme (parse/normalize/validate/map) işlemlerini worker’a taşımak.
- UI tarafı (React bileşeni):
  - Worker’ı başlatır, mesajlaşma protokolünü kullanarak ilerleme ve sonuçları dinler.
  - İptal isteklerini worker’a iletir.
  - Hataları kullanıcıya bildirir.

Dosya/Yapı Önerisi
- client/src/workers/importWorker.ts (veya .ts? Vite için .ts + bundling uygundur)
- client/src/workers/messages.ts (mesaj tipleri ve payload arayüzleri)
- client/src/components/modals/ColumnMappingModal.tsx (worker entegrasyonu)

Mesaj Protokolü
- UI -> Worker
  - INIT: { type: 'INIT', payload: { fileType: 'csv' | 'xlsx', options: { salePriceIncludesVat: boolean, allowPartialImport: boolean } } }
  - MAP_HEADERS: { type: 'MAP_HEADERS', payload: { headers: string[], mappingStrategy?: 'auto' | 'manual' } }
  - PROCESS: { type: 'PROCESS', payload: { file: ArrayBuffer | File, mapping: Record<SystemColumnKey, string> } }
  - CANCEL: { type: 'CANCEL' }
- Worker -> UI
  - READY: { type: 'READY' }
  - HEADERS: { type: 'HEADERS', payload: { headers: string[], previewRows: string[][] } }
  - PROGRESS: { type: 'PROGRESS', payload: { stage: string, current: number, total?: number, percent?: number } }
  - WARNING: { type: 'WARNING', payload: { rowIndex: number, message: string } }
  - ERROR: { type: 'ERROR', payload: { message: string } }
  - RESULT: { type: 'RESULT', payload: { products: Product[], summary: ImportSummary } }
  - CANCELED: { type: 'CANCELED' }

Uygulama Adımları
1) Worker Kurulumu (Vite önerisi)
   - Worker oluşturma (UI tarafında):
     ```ts path=null start=null
     // UI side
     const worker = new Worker(new URL('../workers/importWorker.ts', import.meta.url), { type: 'module' });
     ```
   - Mesaj dinleme ve temizleme:
     ```ts path=null start=null
     useEffect(() => {
       worker.onmessage = (event) => handleWorkerMessage(event.data);
       return () => worker.terminate();
     }, []);
     ```

2) Worker İçeriği (importWorker.ts)
   - self.onmessage ile komutları dinleyin.
   - INIT: global seçenekleri kaydedin (KDV dahil, kısmi import vb.).
   - MAP_HEADERS: girilen headers için otomatik eşleştirme algoritmasını çalıştırın (mevcut ColumnMappingModal’daki mantık taşınacak).
   - PROCESS:
     - fileType ‘csv’ ise Papa.parse’ı worker ortamında kullanın (Papa.parse’un worker uyumlu sürümü veya parse mantığını basitleştirme).
     - fileType ‘xlsx’ ise ExcelJS ile ArrayBuffer üzerinden workbook yükleyin (ExcelJS worker’da çalışabiliyor; bundling’e dikkat edilmeli).
     - Okunan satırları parça parça (chunk) işleyin; her chunk sonrası PROGRESS gönderin.
     - parseTurkishNumber, KDV normalize, priceWithVat/salePrice hesapları gibi CPU ağırlıklı kısımlar worker’da çalışsın.
     - Uyarılar (warnings) ve hatalar (errors) toplanıp periyodik veya finalde gönderilebilir.
   - CANCEL: işlem durum bayrağını (canceled) set edip akışı kibarca sonlandırın ve CANCELED gönderin.

3) UI Entegrasyonu (ColumnMappingModal.tsx)
   - Mevcut readCSV/readExcel ve processRow akışını iki seviyeye bölün:
     - Minimal UI tarafı: dosyayı ArrayBuffer’a çevirme (xlsx) veya direkt File (csv) + worker’a INIT/PROCESS mesajları atma.
     - Worker tarafından gönderilen HEADERS, PROGRESS, WARNING, RESULT mesajlarını ele al.
   - importSummary ve previewData durumlarını worker’dan gelen verilerle güncelle.
   - Hata/iptal durumlarını kullanıcıya bildir.

4) Performans/İyileştirme
   - Chunk boyutu: 500–2000 satır arası deneysel (
     PROGRESS frekansına göre ayarlanabilir).
   - Büyük dosyalarda HEADERS/preview’ı öncelikli gönderip UI’ı erken doldurun.
   - WARNING sayısı çoksa sadece ilk N tanesini UI’a gönderip gerisini final rapora bırakın.

5) Tipler ve Paylaşılan Mantık
   - messages.ts içinde WorkerMessage ve UIMessage tiplerini tanımlayın.
   - parseTurkishNumber, calculatePriceWithoutVat gibi saf fonksiyonlar ortak bir utils’e taşınıp worker tarafından da tüketilebilir.

6) İptal (Cancel) ve Hata Yönetimi
   - UI’da “İptal Et” butonu -> worker.postMessage({ type: 'CANCEL' })
   - Worker tarafında her chunk başında canceled bayrağını kontrol edin.
   - Beklenmeyen hatalarda ERROR mesajı ile UI bilgilensin.

7) Test ve Doğrulama
   - Küçük CSV/XLSX dosyalarıyla başlık eşleştirme, preview ve özet (summary) eşleşmelerini doğrulayın.
   - Büyük dosyada (10k+ satır) UI’nin bloklanmadığını, PROGRESS akışının çalıştığını test edin.
   - CANCEL akışını test edin (işlem ortasında iptal).

Potansiyel Riskler
- ExcelJS’in worker bundling’i: Vite/Rollup yapılandırmasını doğrulayın.
- Papa.parse’un worker’da kullanımı: Gerekirse CSV parse’ı için basit satır ayırma stratejisi veya papaparse’un worker-friendly kullanımını tercih edin.
- Mesajlaşmada büyük payload’lar: Transferable Objects (ArrayBuffer) kullanımı ve kopya maliyetlerine dikkat.

Örnek Worker İskele Kodu
```ts path=null start=null
// client/src/workers/importWorker.ts
import type { Product } from '../types/product';

let options = { salePriceIncludesVat: true, allowPartialImport: true };
let canceled = false;

self.onmessage = async (e: MessageEvent) => {
  const msg = e.data;
  try {
    switch (msg.type) {
      case 'INIT': {
        options = { ...options, ...msg.payload?.options };
        self.postMessage({ type: 'READY' });
        break;
      }
      case 'MAP_HEADERS': {
        const { headers } = msg.payload;
        const mapping = autoMapHeaders(headers); // mevcut mantık taşınacak
        self.postMessage({ type: 'HEADERS', payload: { headers, previewRows: [] } });
        break;
      }
      case 'PROCESS': {
        canceled = false;
        const { file, mapping } = msg.payload;
        const result = await processFileInChunks(file, mapping, (progress) => {
          self.postMessage({ type: 'PROGRESS', payload: progress });
        });
        if (canceled) {
          self.postMessage({ type: 'CANCELED' });
        } else {
          self.postMessage({ type: 'RESULT', payload: result });
        }
        break;
      }
      case 'CANCEL': {
        canceled = true;
        break;
      }
    }
  } catch (err: any) {
    self.postMessage({ type: 'ERROR', payload: { message: err?.message || 'Worker error' } });
  }
};

function autoMapHeaders(headers: string[]) {
  // ColumnMappingModal'daki eşleştirme mantığı taşınacak
  return {};
}

async function processFileInChunks(file: ArrayBuffer | File, mapping: any, onProgress: (p: any) => void) {
  // CSV/XLSX ayrımı yaparak chunk chunk parse + normalize + validate
  // onProgress({ stage, current, total, percent }) çağrıları
  return { products: [] as Product[], summary: { total: 0, success: 0, skipped: 0, errors: [], warnings: [] } };
}
```

Durum (güncel)
- Uygulandı: messages.ts (READ_HEADERS, READ_ALL, PROGRESS, ERROR, RESULT, CANCELED), importWorker.ts (CSV/XLSX okuma + PROCESS_ALL ile satır işleme + PROGRESS/CANCEL), ColumnMappingModal.tsx (worker tabanlı okuma/işleme + fallback + progress/cancel UI), utils/importProcessing.ts (processRow ve yardımcılar paylaşılır).

Sonraki Adımlar
- Büyük dosyalarda chunk bazlı satır okuma/işleme optimizasyonu (şu an satırların tamamı bellekten işleniyor).
- UI’da daha detaylı aşama göstergesi (okuma, eşleme, işleme alt aşamaları).
- Unit testler: importProcessing.ts fonksiyonları ve worker mesaj akışı.

