#!/usr/bin/env sh
# Yerel post-commit hook örneği (Git Bash veya sh çalıştırır)
# Not: .git/hooks/post-commit konumuna kopyalayın ve çalıştırma izni verin.

# Teknik kitap meta
node scripts/update-tech-book-metadata.js
# Basit analiz ve meta güncelleme
node scripts/analyze-project.js
# API/COMPONENTS/PERFORMANCE güncelleme
node scripts/update-api-docs.js
node scripts/update-components.js
node scripts/update-performance-docs.js
# STATUS güncelleme (coverage varsa kısa özet ekler)
node scripts/update-status.js

echo "[post-commit] Dokümantasyon güncellendi."

