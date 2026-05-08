param(
  [string]$RepoUrl = "https://github.com/EnsarKarayel/argeka-sync.git",
  [string]$InstallDir = "$env:USERPROFILE\Desktop\ARGEKA-Sync"
)

$ErrorActionPreference = "Stop"

function Write-Step($Message) {
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Test-Command($Name) {
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Install-WithWinget($Id, $Name) {
  if (-not (Test-Command "winget")) {
    throw "winget bulunamadi. Lutfen Git ve Docker Desktop'i elle kurun."
  }

  Write-Step "$Name kuruluyor"
  winget install --exact --id $Id --accept-package-agreements --accept-source-agreements
}

if (-not (Test-Command "git")) {
  Install-WithWinget "Git.Git" "Git"
  $env:Path = "$env:ProgramFiles\Git\cmd;$env:Path"
}

if (-not (Test-Command "git")) {
  throw "Git hazir degil. PowerShell'i yeniden acip komutu tekrar calistirin."
}

if (Test-Path (Join-Path $InstallDir ".git")) {
  Write-Step "Repo guncelleniyor"
  Push-Location $InstallDir
  try {
    git pull
  } finally {
    Pop-Location
  }
} else {
  Write-Step "Repo indiriliyor"
  if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir | Out-Null
  }
  git clone $RepoUrl $InstallDir
}

$installer = Join-Path $InstallDir "install.ps1"
Write-Step "Kurulum baslatiliyor"
& powershell.exe -ExecutionPolicy Bypass -File $installer
