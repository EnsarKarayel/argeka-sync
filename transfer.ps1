param(
  [ValidateSet("csv", "sql")]
  [string]$Format = "csv",
  [string]$OutputDir = ".\exports"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $RepoRoot ".env"

function Read-EnvValue($Name, $Default) {
  if (!(Test-Path $EnvFile)) {
    return $Default
  }
  $line = Get-Content $EnvFile | Where-Object { $_ -match "^$Name=" } | Select-Object -First 1
  if (!$line) {
    return $Default
  }
  return $line -replace "^$Name=", ""
}

$dbName = Read-EnvValue "POSTGRES_DB" "akis_crm"
$dbUser = Read-EnvValue "POSTGRES_USER" "akis"
$exportPath = Join-Path $RepoRoot $OutputDir
if (!(Test-Path $exportPath)) {
  New-Item -ItemType Directory -Path $exportPath | Out-Null
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
if ($Format -eq "csv") {
  $filePath = Join-Path $exportPath "argeka-opportunities-$stamp.csv"
  docker exec akis-crm-db psql -U $dbUser -d $dbName -c "\copy (select title, stage, value, probability, forecast, source, close_date, next_action, note from opportunities order by created_at desc) to stdout with csv header" | Out-File -FilePath $filePath -Encoding utf8
} else {
  $filePath = Join-Path $exportPath "argeka-portable-$stamp.sql"
  docker exec akis-crm-db pg_dump -U $dbUser -d $dbName --data-only --inserts --table=opportunities --table=accounts --table=contacts | Out-File -FilePath $filePath -Encoding utf8
}

Write-Host "Aktarim dosyasi hazir: $filePath" -ForegroundColor Green
