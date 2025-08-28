# Bu kısayol betiği, deponun kökünde npm run docs:all komutunu çalıştırır.
# Kullanım (PowerShell):
#   pwsh -File RUN-DOCS-ALL.ps1

$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Push-Location $root
try {
  Write-Host "▶️  Çalıştırılıyor: npm run docs:all (konum: $root)"
  npm run docs:all
}
finally {
  Pop-Location
}

