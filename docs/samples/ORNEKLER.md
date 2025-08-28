# Örnekler (samples)

Bu klasör, test ve dokümantasyon amaçlı örnek veri dosyalarını içerir.

- products-template.csv: İçe aktarma için örnek şablon
- products-small.csv: Küçük test datası
- backup-sample.json: Basitleştirilmiş örnek yedek içeriği
- performance/products-large-sample.json: Büyük veri performans denemeleri için

IPC örnekleri (docs/samples/ipc/)
- update-status.sample.json
- update-progress.sample.json
- create-backup-result.sample.json
- backup-progress.sample.json
- db-import-base64.sample.json
- db-import-response.sample.json
- schedule-backup-request.sample.json
- set-backup-directory-request.sample.json

Servis örnekleri (docs/samples/services/)
- product.sample.json
- sale.sample.json
- receipt.sample.json

Doğrulama (Ajv ile)
```bash
npm run validate:samples --prefix client
# veya hepsi bir arada
npm run validate:all --prefix client
```

