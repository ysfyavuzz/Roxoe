Param(
  [string]$Root = "..\..",
  [switch]$OpenReport
)

$ErrorActionPreference = 'Stop'

# Dışlanacak klasörler
$exclude = @('node_modules','.git','dist','build','coverage','.next','out','.turbo','.parcel-cache','.cache','.vscode')
# Metin uzantıları
$textExts = @('.ts','.tsx','.js','.jsx','.json','.md','.css','.scss','.less','.html','.htm','.yml','.yaml','.txt','.env','.sh','.ps1','.psm1','.bat','.toml','.xml','.svg','.ini','.cfg','.conf')

function Should-Exclude($path) {
  foreach ($e in $exclude) { if ($path -like "*\$e\*") { return $true } }
  return $false
}

$rootPath = Resolve-Path -LiteralPath $Root
$files = Get-ChildItem -LiteralPath $rootPath -Recurse -File -Force | Where-Object {
  -not (Should-Exclude $_.FullName) -and ($textExts -contains ($_.Extension.ToLower()))
} | ForEach-Object {
  $lines = 0
  try { $lines = (Get-Content -LiteralPath $_.FullName -ErrorAction Stop | Measure-Object -Line).Lines } catch { $lines = 0 }
  [PSCustomObject]@{
    RelPath   = $_.FullName.Substring($rootPath.Path.Length+1)
    SizeBytes = $_.Length
    Lines     = $lines
  }
}

$files = $files | Sort-Object RelPath
$totalLines = ($files | Measure-Object -Property Lines -Sum).Sum
$totalBytes = ($files | Measure-Object -Property SizeBytes -Sum).Sum

# En büyük/uzun 20 dosya
$topSize = $files | Sort-Object SizeBytes -Descending | Select-Object -First 20
$topLines = $files | Sort-Object Lines -Descending | Select-Object -First 20

$report = [PSCustomObject]@{
  GeneratedAt    = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
  TotalLines     = $totalLines
  TotalSizeBytes = $totalBytes
  Files          = $files
  TopBySize      = $topSize
  TopByLines     = $topLines
}

$metricsPath = Join-Path $rootPath 'docs/file-metrics.json'
$summaryPath = Join-Path $rootPath 'docs/file-metrics-summary.md'

$report | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $metricsPath -Encoding UTF8

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("# File Metrics Summary")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("Generated: $($report.GeneratedAt)")
[void]$sb.AppendLine("Total lines: $totalLines")
[void]$sb.AppendLine("Total size (bytes): $totalBytes")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("## Top 20 By Size")
foreach ($f in $topSize) { [void]$sb.AppendLine("- $($f.RelPath) — $($f.SizeBytes) bytes, $($f.Lines) lines") }
[void]$sb.AppendLine("")
[void]$sb.AppendLine("## Top 20 By Lines")
foreach ($f in $topLines) { [void]$sb.AppendLine("- $($f.RelPath) — $($f.Lines) lines, $($f.SizeBytes) bytes") }
$sb.ToString() | Set-Content -LiteralPath $summaryPath -Encoding UTF8

Write-Host "Wrote $metricsPath" -ForegroundColor Green
Write-Host "Wrote $summaryPath" -ForegroundColor Green

if ($OpenReport) { Start-Process $summaryPath }

