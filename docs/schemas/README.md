# Şemalar (JSON Schema)

Bu klasör, IPC kanalları ve servis DTO’ları için JSON Schema tanımlarını içerir.

## Amaç
- Payload’ların sözleşme (contract) seviyesinde doğrulanması (Ajv ile)
- Geriye dönük uyumluluk ihlallerini erken yakalamak

## Yapı
- ipc/: Uygulama içi IPC kanalı payload’ları
- services/: Servis veri aktarım objeleri (DTO)

## Doğrulama (örnek)
```bash
# Ajv CLI ile
npx ajv -s docs/schemas/ipc/update-status.schema.json -d payload.json
```

## Proje içi komutlar
```bash
# Tüm şemaları derle (syntax/uyumluluk kontrolü)
npm run validate:schemas --prefix client   # ajv-formats ile (date-time vb.)

# Örnek JSON dosyalarını ilgili şemalara göre doğrula
npm run validate:samples --prefix client   # Node script + ajv-formats

# Hepsini bir arada çalıştır
npm run validate:all --prefix client
```

## Notlar
- Şemalar living-document niteliğindedir; payload değişimlerinde güncellenmelidir.
- Breaking change durumlarında semantik sürüm notu ekleyin (CHANGELOG).

