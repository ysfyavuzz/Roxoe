param(
  [string]$Input = "docs/roxoepos-technical-book.md",
  [string]$PdfOut = "docs/roxoepos-technical-book.pdf",
  [switch]$Open
)

Write-Host "📄 Kaynak: $Input"
if (-not (Test-Path -LiteralPath $Input)) {
  Write-Error "Girdi dosyası bulunamadı: $Input"
  exit 1
}

$pandoc = Get-Command pandoc -ErrorAction SilentlyContinue
if (-not $pandoc) {
  Write-Error "Pandoc bulunamadı. Lütfen pandoc kurun: https://pandoc.org/installing.html"
  exit 1
}

try {
  Write-Host "🛠️  PDF üretiliyor → $PdfOut"
  & pandoc -s -f gfm -t pdf -o $PdfOut $Input
  if ($LASTEXITCODE -ne 0) { throw "Pandoc PDF dönüşümü başarısız (exit: $LASTEXITCODE)" }
  Write-Host "✅ PDF üretildi: $PdfOut"
  if ($Open) { Start-Process $PdfOut }
}
catch {
  Write-Warning $_
  Write-Host "⚠️  PDF üretimi başarısız oldu. Alternatif olarak HTML üretmeyi deneyin:"
  Write-Host "    pandoc -s -f gfm -t html5 -o docs/roxoepos-technical-book.html $Input"
  exit 2
}

