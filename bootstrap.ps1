param(
  [string]$RepoUrl = "https://github.com/EnsarKarayel/argeka-sync.git",
  [string]$InstallDir = "$env:USERPROFILE\Desktop\ARGEKA-Sync",
  [ValidateSet("tr", "en")]
  [string]$Lang = "tr"
)

$ErrorActionPreference = "Stop"

function T($Tr, $En) {
  if ($Lang -eq "en") {
    return $En
  }

  return $Tr
}

function Write-Step($Message) {
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Test-Command($Name) {
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Install-WithWinget($Id, $Name) {
  if (-not (Test-Command "winget")) {
    throw (T "winget bulunamadi. Lutfen Git ve Docker Desktop'i elle kurun." "winget was not found. Please install Git and Docker Desktop manually.")
  }

  Write-Step (T "$Name kuruluyor" "Installing $Name")
  winget install --exact --id $Id --accept-package-agreements --accept-source-agreements
}

if (-not (Test-Command "git")) {
  Install-WithWinget "Git.Git" "Git"
  $env:Path = "$env:ProgramFiles\Git\cmd;$env:Path"
}

if (-not (Test-Command "git")) {
  throw (T "Git hazir degil. PowerShell'i yeniden acip komutu tekrar calistirin." "Git is not ready yet. Open PowerShell again and run the setup once more.")
}

if (Test-Path (Join-Path $InstallDir ".git")) {
  Write-Step (T "Kurulum dosyalari guncelleniyor" "Updating setup files")
  Push-Location $InstallDir
  try {
    git pull
  } finally {
    Pop-Location
  }
} else {
  Write-Step (T "Kurulum dosyalari indiriliyor" "Downloading setup files")
  if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir | Out-Null
  }
  git clone $RepoUrl $InstallDir
}

$installer = Join-Path $InstallDir "install.ps1"
Write-Step (T "ARGEKA Sync kurulumu baslatiliyor" "Starting ARGEKA Sync installation")
& powershell.exe -ExecutionPolicy Bypass -File $installer -Lang $Lang
