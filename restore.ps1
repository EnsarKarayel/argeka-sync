param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile
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

if (!(Test-Path $BackupFile)) {
  throw "Yedek dosyasi bulunamadi: $BackupFile"
}

$dbName = Read-EnvValue "POSTGRES_DB" "akis_crm"
$dbUser = Read-EnvValue "POSTGRES_USER" "akis"
$resolved = Resolve-Path $BackupFile

Write-Host "ARGEKA CRM geri yukleme basliyor: $resolved" -ForegroundColor Yellow
docker cp $resolved akis-crm-db:/tmp/argeka-restore.sql
docker exec akis-crm-db psql -U $dbUser -d $dbName -f /tmp/argeka-restore.sql

$fileName = Split-Path $resolved -Leaf
$sqlFileName = $fileName.Replace("'", "''")
docker exec akis-crm-db psql -U $dbUser -d $dbName -c "insert into backup_runs (file_name, status, kind, size_bytes) values ('$sqlFileName', 'completed', 'restore', 0);"

Write-Host "Geri yukleme tamamlandi." -ForegroundColor Green
