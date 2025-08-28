// PR açıklamasında zorunlu bölümlerin bulunup bulunmadığını kontrol eder.
// GitHub Actions bu scripti pull_request event'i ile çalıştırır.

const fs = require('fs');

function fail(msg) {
  console.error(`PR validation failed: ${msg}`);
  process.exit(1);
}

function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.log('GITHUB_EVENT_PATH bulunamadı; kontrol atlanıyor.');
    return;
  }
  const payload = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const pr = payload.pull_request;
  if (!pr) {
    console.log('pull_request olayı değil; kontrol atlanıyor.');
    return;
  }
  const body = (pr.body || '').toLowerCase();

  const requiredSections = [
    'amaç',
    'kapsam',
    'ekran', // "Ekran Görüntüleri / Video" başlığını kapsar
    'test',
    'risk',
    'doküman',
  ];

  const missing = requiredSections.filter((s) => !body.includes(s));
  if (missing.length > 0) {
    fail(`PR açıklamasında eksik bölüm(ler): ${missing.join(', ')}`);
  }

  console.log('PR açıklaması temel şablon gereksinimlerini karşılıyor.');
}

main();

