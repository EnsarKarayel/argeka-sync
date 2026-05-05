param(
  [string]$BackupDir = ".\backups"
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
$backupPath = Join-Path $RepoRoot $BackupDir
if (!(Test-Path $backupPath)) {
  New-Item -ItemType Directory -Path $backupPath | Out-Null
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$fileName = "argeka-crm-$stamp.sql"
$filePath = Join-Path $backupPath $fileName

Write-Host "ARGEKA CRM yedek aliniyor: $filePath" -ForegroundColor Cyan
docker exec akis-crm-db pg_dump -U $dbUser -d $dbName --clean --if-exists --encoding=UTF8 | Out-File -FilePath $filePath -Encoding utf8

$size = (Get-Item $filePath).Length
$sqlFileName = $fileName.Replace("'", "''")
docker exec akis-crm-db psql -U $dbUser -d $dbName -c "insert into backup_runs (file_name, status, kind, size_bytes) values ('$sqlFileName', 'completed', 'backup', $size);"

Write-Host "Yedek tamamlandi: $filePath" -ForegroundColor Green
