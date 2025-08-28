# PowerShell yerel post-commit örneği
# Not: Git varsayılan olarak sh hook çalıştırır. Eğer PowerShell kullanacaksanız core.hooksPath ile özel yol tanımlayın.
# Örn: git config core.hooksPath .githooks
#      ve bu dosyayı .githooks/post-commit.ps1 olarak kaydedin.

node scripts/update-tech-book-metadata.js
node scripts/analyze-project.js
node scripts/update-api-docs.js
node scripts/update-components.js
node scripts/update-performance-docs.js
node scripts/update-status.js

Write-Host "[post-commit] Dokümantasyon güncellendi."

