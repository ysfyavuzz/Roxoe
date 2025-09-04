// Test dosyası
const features = {
  brand: '',
  category: '',
  type: '',
  volume: '',
  packaging: '',
  alcohol: false
};

const productName = 'Efes Tombul Şişe 50cl';

// Marka tespiti
const brands = ['Efes', 'Tuborg', 'Bomonti', 'Arda', 'Çaykur'];
for (const brand of brands) {
  if (productName.toLowerCase().includes(brand.toLowerCase())) {
    features.brand = brand;
    break;
  }
}

console.log('Marka tespiti:', features.brand);

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

console.log('Kategori tespiti:', features.category);
console.log('Alkol durumu:', features.alcohol);

// Tip tespiti
if (productName.toLowerCase().includes('tombul')) {
  features.type = 'Tombul';
} else if (productName.toLowerCase().includes('normal')) {
  features.type = 'Normal';
}

console.log('Tip tespiti:', features.type);

// Hacim tespiti
const volumeRegex = /(\d+(?:[.,]\d+)?)\s*(cl|ml|lt|l)/i;
const volumeMatch = productName.match(volumeRegex);
if (volumeMatch) {
  features.volume = `${volumeMatch[1]} ${volumeMatch[2]}`;
}

console.log('Hacim tespiti:', features.volume);

// Ambalaj tespiti
if (productName.toLowerCase().includes('şişe')) {
  features.packaging = 'Şişe';
} else if (productName.toLowerCase().includes('kutu')) {
  features.packaging = 'Kutu';
} else if (productName.toLowerCase().includes('pet')) {
  features.packaging = 'PET';
}

console.log('Ambalaj tespiti:', features.packaging);

console.log('Sonuç:', features);