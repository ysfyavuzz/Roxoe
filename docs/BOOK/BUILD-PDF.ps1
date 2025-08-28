Param(
  [string]$MarkdownPath = "..\BOOK\ROXOEPOS-KITAP.md",
  [string]$OutPdfPath = "..\BOOK\ROXOEPOS-KITAP.pdf",
  [switch]$Open
)

$ErrorActionPreference = 'Stop'

function Test-Exe($name) {
  $p = Get-Command $name -ErrorAction SilentlyContinue
  return $null -ne $p
}

# Pandoc ile PDF (varsayılan öneri)
if (Test-Exe 'pandoc') {
  Write-Host "[INFO] Pandoc bulundu, PDF oluşturuluyor..." -ForegroundColor Green
  pandoc -V geometry:margin=1in -V mainfont="Segoe UI" -o $OutPdfPath $MarkdownPath
  if ($LASTEXITCODE -ne 0) { throw "Pandoc PDF üretimi başarısız oldu." }
  if ($Open) { Start-Process $OutPdfPath }
  exit 0
}

Write-Warning "Pandoc bulunamadı. Alternatif üretim yolları:" 
Write-Host "1) Pandoc kurun: https://pandoc.org/installing.html ve komutu tekrar çalıştırın" -ForegroundColor Yellow
Write-Host "2) VS Code ile Markdown’u 'Open Preview to the Side' → 'Print' ile PDF'e yazdırın" -ForegroundColor Yellow
Write-Host "3) HTML'e dönüştürüp tarayıcıdan yazdırın:" -ForegroundColor Yellow
Write-Host "   powershell -c \"(Get-Content $MarkdownPath) -join '`n' | Out-File ROXOEPOS-KITAP.html\"" -ForegroundColor Yellow

