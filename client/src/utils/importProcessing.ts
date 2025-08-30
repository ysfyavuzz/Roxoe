// client/src/utils/importProcessing.ts
import { Product, VatRate } from "../types/product";

import { parseTurkishNumber } from "./../utils/numberFormatUtils";
import { calculatePriceWithoutVat } from "./../utils/vatUtils";

export interface ProcessResult {
  product: Product | null;
  warning?: string;
}

export interface ImportSummary {
  total: number;
  success: number;
  skipped: number;
  errors: Array<{ rowIndex: number; message: string }>;
  warnings: Array<{ rowIndex: number; message: string }>;
}

export type SystemColumnKey =
  | "name"
  | "barcode"
  | "purchasePrice"
  | "salePrice"
  | "vatRate"
  | "stock"
  | "category";

export const REQUIRED_FIELDS: readonly SystemColumnKey[] = [
  "name",
  "barcode",
  "purchasePrice",
  "salePrice",
  "vatRate",
  "stock",
  "category",
] as const;

export const SYSTEM_COLUMNS: Record<SystemColumnKey, string> = {
  name: "Ürün Adı",
  barcode: "Barkod",
  purchasePrice: "Alış Fiyatı",
  salePrice: "Satış Fiyatı",
  vatRate: "KDV Oranı",
  stock: "Stok",
  category: "Kategori",
};

export const VAT_RATE_MAP: Record<string, VatRate> = {
  "0": 0,
  "0.0": 0,
  "0%": 0,
  "%0": 0,
  "1": 1,
  "1.0": 1,
  "1%": 1,
  "%1": 1,
  "8": 8,
  "8.0": 8,
  "8%": 8,
  "%8": 8,
  "18": 18,
  "18.0": 18,
  "18%": 18,
  "%18": 18,
  "20": 20,
  "20.0": 20,
  "20%": 20,
  "%20": 20,
};

function cleanValue(value: unknown): string {
  if (value === null || value === undefined) {return "";}
  return String(value).trim();
}

export function parseNumberWithTurkishSupport(value: unknown): number | null {
  const s = cleanValue(value);
  if (s === "") {return null;}
  const parsedNumber = parseTurkishNumber(s);
  return parsedNumber !== undefined ? parsedNumber : null;
}

export function normalizeVatRate(value: unknown): VatRate | null {
  const base = cleanValue(value);
  if (base === "") {return null;}
  const cleaned = base.replace(/\s/g, "").replace(/%/g, "").replace(/,/g, ".");
  if (Object.prototype.hasOwnProperty.call(VAT_RATE_MAP, cleaned)) {
    return VAT_RATE_MAP[cleaned as keyof typeof VAT_RATE_MAP] as VatRate;
  }
  const numValue = parseNumberWithTurkishSupport(cleaned);
  if (numValue === null) {return null;}
  const validRates: VatRate[] = [0, 1, 8, 18, 20];
  const closest = validRates.reduce((prev, curr) => (Math.abs(curr - numValue) < Math.abs(prev - numValue) ? curr : prev));
  return closest as VatRate;
}

export function processRow(
  row: Record<string, unknown>,
  rowIndex: number,
  mapping: Record<SystemColumnKey, string>,
  salePriceIncludesVat: boolean
): ProcessResult {
  const warnings: string[] = [];
  try {
    const product: Partial<Product> = {};

    for (const field of REQUIRED_FIELDS) {
      const fileField = mapping[field];
      if (!fileField) {
        throw new Error(`${SYSTEM_COLUMNS[field]} alanı eşleştirilmemiş`);
      }
      const rawValue = row[fileField];
      if (rawValue === undefined || rawValue === null || rawValue === "") {
        if (field === "barcode" || field === "name") {
          throw new Error(`Satır ${rowIndex + 2}: ${SYSTEM_COLUMNS[field]} alanı boş`);
        } else {
          warnings.push(`${SYSTEM_COLUMNS[field]} alanı boş, varsayılan değer kullanılacak`);
        }
      }
    }

    for (const [systemField, fileField] of Object.entries(mapping)) {
      if (!fileField) {continue;}
      const rawValue = row[fileField];
      switch (systemField as SystemColumnKey) {
        case "vatRate": {
          const vatRate = normalizeVatRate(rawValue);
          if (vatRate === null) {
            warnings.push(`Geçersiz KDV oranı: "${rawValue}", varsayılan değer 18 kullanılacak`);
            product.vatRate = 18;
          } else {
            product.vatRate = vatRate;
          }
          break;
        }
        case "purchasePrice": {
          const price = parseNumberWithTurkishSupport(rawValue);
          if (price === null) {
            warnings.push(`Geçersiz alış fiyatı: "${rawValue}", varsayılan değer 0 kullanılacak`);
            product.purchasePrice = 0;
          } else if (price < 0) {
            warnings.push(`Negatif alış fiyatı: ${price}, pozitif değer kullanılacak`);
            product.purchasePrice = Math.abs(price);
          } else {
            product.purchasePrice = price;
          }
          break;
        }
        case "salePrice": {
          const price = parseNumberWithTurkishSupport(rawValue);
          if (price === null) {
            if (product.purchasePrice !== undefined) {
              warnings.push(`Geçersiz satış fiyatı: "${rawValue}", alış fiyatı kullanılacak`);
              product.salePrice = product.purchasePrice;
            } else {
              warnings.push(`Geçersiz satış fiyatı: "${rawValue}", varsayılan değer 0 kullanılacak`);
              product.salePrice = 0;
            }
          } else if (price < 0) {
            warnings.push(`Negatif satış fiyatı: ${price}, pozitif değer kullanılacak`);
            product.salePrice = Math.abs(price);
          } else {
            if (salePriceIncludesVat) {
              product.priceWithVat = price;
              if (product.vatRate !== undefined) {
                product.salePrice = calculatePriceWithoutVat(price, product.vatRate);
              } else {
                product.salePrice = price;
              }
            } else {
              product.salePrice = price;
              if (product.vatRate !== undefined) {
                product.priceWithVat = Number((price * (1 + product.vatRate / 100)).toFixed(2));
              } else {
                product.priceWithVat = price;
              }
            }
          }
          break;
        }
        case "stock": {
          const stock = parseNumberWithTurkishSupport(rawValue);
          if (stock === null) {
            warnings.push(`Geçersiz stok miktarı: "${rawValue}", varsayılan değer 0 kullanılacak`);
            product.stock = 0;
          } else if (stock < 0) {
            warnings.push(`Negatif stok miktarı: ${stock}, 0 kullanılacak`);
            product.stock = 0;
          } else {
            product.stock = Math.floor(stock);
          }
          break;
        }
        case "name": {
          const strValue = cleanValue(rawValue);
          if (!strValue) {
            throw new Error(`${SYSTEM_COLUMNS[systemField as SystemColumnKey]} boş olamaz`);
          }
          product.name = strValue;
          break;
        }
        case "barcode": {
          const strValue = cleanValue(rawValue);
          if (!strValue) {
            throw new Error(`${SYSTEM_COLUMNS[systemField as SystemColumnKey]} boş olamaz`);
          }
          const cleanedBarcode = strValue.replace(/\D/g, "");
          if (cleanedBarcode !== strValue) {
            warnings.push(`Barkod temizlendi: "${strValue}" -> "${cleanedBarcode}"`);
          }
          product.barcode = cleanedBarcode;
          break;
        }
        case "category": {
          const strValue = cleanValue(rawValue);
          if (!strValue) {
            warnings.push(`Kategori boş, varsayılan "Genel" kullanılacak`);
            product.category = "Genel";
          } else {
            product.category = strValue;
          }
          break;
        }
      }
    }

    if (product.vatRate === undefined) {
      product.vatRate = 18;
      warnings.push("KDV oranı belirlenemedi, varsayılan %18 kullanıldı");
    }

    if (salePriceIncludesVat && product.priceWithVat !== undefined) {
      product.salePrice = calculatePriceWithoutVat(product.priceWithVat, product.vatRate);
    } else if (!salePriceIncludesVat && product.salePrice !== undefined) {
      product.priceWithVat = Number((product.salePrice * (1 + product.vatRate / 100)).toFixed(2));
    }

    if (product.purchasePrice === undefined) {
      product.purchasePrice = product.salePrice || 0;
      warnings.push("Alış fiyatı belirlenemedi, satış fiyatı kullanıldı");
    }

    if (product.salePrice === undefined) {
      product.salePrice = product.purchasePrice || 0;
      warnings.push("Satış fiyatı belirlenemedi, alış fiyatı kullanıldı");
    }

    if (product.priceWithVat === undefined) {
      product.priceWithVat = product.salePrice;
      warnings.push("KDV'li fiyat hesaplanamadı, satış fiyatı kullanıldı");
    }

    if (product.stock === undefined) {
      product.stock = 0;
      warnings.push("Stok miktarı belirlenemedi, 0 kullanıldı");
    }

    if (
      isNaN(product.salePrice as number) ||
      isNaN(product.priceWithVat as number) ||
      isNaN(product.purchasePrice as number)
    ) {
      throw new Error(
        `Satır ${rowIndex + 2}: Fiyat hesaplamasında hata oluştu. Lütfen fiyat ve KDV değerlerini kontrol edin.`
      );
    }

    const completeProduct: Product = {
      id: 0,
      name: product.name!,
      barcode: product.barcode!,
      purchasePrice: product.purchasePrice!,
      salePrice: product.salePrice!,
      vatRate: product.vatRate!,
      priceWithVat: product.priceWithVat!,
      category: product.category!,
      stock: product.stock!,
    };

    const out: ProcessResult = {
      product: completeProduct,
    };
    if (warnings.length > 0) {
      out.warning = warnings.join("; ");
    }
    return out;
  } catch (error: unknown) {
    return {
      product: null,
      warning: error instanceof Error ? error.message : "Bilinmeyen hata",
    };
  }
}

export function processAllRows(
  rows: Record<string, unknown>[],
  mapping: Record<SystemColumnKey, string>,
  salePriceIncludesVat: boolean,
  allowPartialImport: boolean,
  onProgress?: (p: { stage: string; current: number; total: number; percent: number }) => void,
  canceledRef?: { current: boolean }
): { products: Product[]; summary: ImportSummary } {
  const products: Product[] = [];
  const summary: ImportSummary = {
    total: rows.length,
    success: 0,
    skipped: 0,
    errors: [],
    warnings: [],
  };

  const total = rows.length;
  rows.forEach((row, index) => {
    if (canceledRef?.current) {return;}
    const result = processRow(row, index, mapping, salePriceIncludesVat);
    if (result.product) {
      products.push(result.product);
      summary.success++;
      if (result.warning) {
        summary.warnings.push({ rowIndex: index + 2, message: result.warning });
      }
    } else {
      summary.skipped++;
      if (result.warning) {
        summary.errors.push({ rowIndex: index + 2, message: result.warning });
      }
    }
    if (onProgress) {
      const current = index + 1;
      const percent = Math.round((current / total) * 100);
      onProgress({ stage: "processing", current, total, percent });
    }
  });

  if (canceledRef?.current) {
    // Return partial results if canceled; UI can ignore if desired
  }

  return { products, summary };
}

