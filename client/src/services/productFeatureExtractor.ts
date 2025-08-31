// services/productFeatureExtractor.ts
import CategoryService from './categoryService';

export interface ProductFeatures {
  brand: string;
  category: string;
  type: string;
  volume: string;
  packaging: string;
  alcohol: boolean;
}

export type CategoryPath = string[];

class ProductFeatureExtractor {
  // Ürün adından özellik çıkarımı
  static extractFeatures(productName: string): ProductFeatures {
    const features: ProductFeatures = {
      brand: '',
      category: '',
      type: '',
      volume: '',
      packaging: '',
      alcohol: false
    };

    // Marka tespiti
    const brands = ['Efes', 'Tuborg', 'Bomonti', 'Arda', 'Çaykur'];
    for (const brand of brands) {
      if (productName.toLowerCase().includes(brand.toLowerCase())) {
        features.brand = brand;
        break;
      }
    }

    // Kategori tespiti
    if (productName.toLowerCase().includes('bira')) {
      features.category = 'Bira';
      features.alcohol = true;
    } else if (productName.toLowerCase().includes('raki') || 
               productName.toLowerCase().includes('votka') ||
               productName.toLowerCase().includes('cin')) {
      features.category = 'Sert Alkollü İçecekler';
      features.alcohol = true;
    } else if (productName.toLowerCase().includes('gazoz') ||
               productName.toLowerCase().includes('kola') ||
               productName.toLowerCase().includes('limonata')) {
      features.category = 'Gazlı İçecekler';
      features.alcohol = false;
    } else if (productName.toLowerCase().includes('su')) {
      features.category = 'Su';
      features.alcohol = false;
    } else if (productName.toLowerCase().includes('çay') ||
               productName.toLowerCase().includes('kahve')) {
      features.category = 'Sıcak İçecekler';
      features.alcohol = false;
    } else if (productName.toLowerCase().includes('meyve suyu') ||
               productName.toLowerCase().includes('portakal suyu') ||
               productName.toLowerCase().includes('elma suyu')) {
      features.category = 'Meyve Suları';
      features.alcohol = false;
    }

    // Tip tespiti
    if (productName.toLowerCase().includes('tombul')) {
      features.type = 'Tombul';
    } else if (productName.toLowerCase().includes('normal')) {
      features.type = 'Normal';
    }

    // Hacim tespiti
    const volumeRegex = /(\d+(?:[.,]\d+)?)\s*(cl|ml|lt|l)/i;
    const volumeMatch = productName.match(volumeRegex);
    if (volumeMatch) {
      features.volume = `${volumeMatch[1]} ${volumeMatch[2]}`;
    }

    // Ambalaj tespiti
    if (productName.toLowerCase().includes('şişe')) {
      features.packaging = 'Şişe';
    } else if (productName.toLowerCase().includes('kutu')) {
      features.packaging = 'Kutu';
    } else if (productName.toLowerCase().includes('pet')) {
      features.packaging = 'PET';
    }

    return features;
  }

  // Özelliklere göre kategori önerisi
  static async suggestCategory(features: ProductFeatures): Promise<CategoryPath> {
    const categoryPath: string[] = ['İçecek'];
    
    // Alkollü/alkolsüz kategori
    categoryPath.push(features.alcohol ? 'Alkollü İçecekler' : 'Alkolsüz İçecekler');
    
    // Ana kategori
    if (features.category) {
      categoryPath.push(features.category);
    }
    
    // Marka grubu
    if (features.brand) {
      categoryPath.push(`${features.brand} Grubu`);
    }
    
    return categoryPath;
  }
}

export default ProductFeatureExtractor;