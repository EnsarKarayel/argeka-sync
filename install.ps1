param(
  [switch]$SkipDependencyInstall,
  [switch]$NoOpen
)

$ErrorActionPreference = "Stop"
$InstallerPath = $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ComposeFile = Join-Path $RepoRoot "deployment\self-hosted\docker-compose.yml"
$EnvFile = Join-Path $RepoRoot ".env"
$EnvExample = Join-Path $RepoRoot ".env.example"

function Write-Step($Message) {
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Test-Command($Name) {
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Test-Admin {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($identity)
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-WslReady {
  if (-not (Test-Command "wsl")) {
    return $false
  }

  try {
    wsl --status | Out-Null
    return $true
  } catch {
    return $false
  }
}

function Ensure-ElevatedForDependencyInstall {
  if ($SkipDependencyInstall) {
    return
  }

  $needsInstall = (-not (Test-Command "docker")) -or (-not (Test-WslReady))
  if ($needsInstall -and -not (Test-Admin)) {
    Write-Step "Kurulum icin yonetici izni isteniyor"
    $arguments = @("-ExecutionPolicy", "Bypass", "-File", "`"$InstallerPath`"")
    if ($NoOpen) {
      $arguments += "-NoOpen"
    }

    Start-Process powershell.exe -Verb RunAs -ArgumentList $arguments
    exit
  }
}

function Install-WithWinget($Id, $Name) {
  if ($SkipDependencyInstall) {
    throw "$Name bulunamadi. -SkipDependencyInstall kullanildigi icin otomatik kurulum atlandi."
  }

  if (-not (Test-Command "winget")) {
    throw "winget bulunamadi. Lutfen once Microsoft App Installer/winget kurun veya $Name uygulamasini elle kurun."
  }

  Write-Step "$Name kuruluyor"
  winget install --exact --id $Id --accept-package-agreements --accept-source-agreements
}

function Ensure-WSL {
  if (Test-WslReady) {
    return
  }

  if ($SkipDependencyInstall) {
    throw "WSL hazir degil. Docker Desktop icin WSL gerekli olabilir."
  }

  Write-Step "WSL altyapisi kuruluyor"
  wsl --install --no-distribution
  Write-Host "WSL kurulumu yeniden baslatma isteyebilir. Yeniden baslatma gerekirse ayni komutu tekrar calistirin." -ForegroundColor Yellow
}

function Ensure-Docker {
  if (-not (Test-Command "docker")) {
    Install-WithWinget "Docker.DockerDesktop" "Docker Desktop"
    $dockerCli = Join-Path $env:ProgramFiles "Docker\Docker\resources\bin"
    $env:Path = "$dockerCli;$env:Path"
  }

  if (-not (Test-Command "docker")) {
    throw "Docker komutu bulunamadi. Docker Desktop kurulduysa bilgisayari yeniden baslatin ve install.ps1 dosyasini tekrar calistirin."
  }

  try {
    docker info | Out-Null
    return
  } catch {
    $dockerDesktop = Join-Path $env:ProgramFiles "Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerDesktop) {
      Write-Step "Docker Desktop baslatiliyor"
      Start-Process -FilePath $dockerDesktop -WindowStyle Hidden
    }
  }

  Write-Step "Docker motoru bekleniyor"
  for ($i = 1; $i -le 36; $i++) {
    try {
      docker info | Out-Null
      return
    } catch {
      Start-Sleep -Seconds 5
    }
  }

  throw "Docker Desktop hazir olmadi. Uygulamayi acip Linux engine hazir olduktan sonra install.ps1 dosyasini tekrar calistirin."
}

function Ensure-EnvFile {
  if (-not (Test-Path $EnvFile)) {
    Copy-Item -Path $EnvExample -Destination $EnvFile
    Write-Host ".env olusturuldu. Canli ortamda POSTGRES_PASSWORD degerini degistirin." -ForegroundColor Yellow
  }
}

function Start-Stack {
  Write-Step "ARGEKA CRM Docker servisleri baslatiliyor"
  Push-Location $RepoRoot
  try {
    docker compose --env-file $EnvFile -f $ComposeFile up -d --build
  } finally {
    Pop-Location
  }
}

function Show-Status {
  Write-Step "Servis durumu"
  docker compose --env-file $EnvFile -f $ComposeFile ps
  Write-Host ""
  Write-Host "Web: http://localhost:$((Get-Content $EnvFile | Where-Object { $_ -match '^WEB_PORT=' } | Select-Object -First 1) -replace '^WEB_PORT=', '')" -ForegroundColor Green
  Write-Host "Demo: admin@akis-crm.local / admin123" -ForegroundColor Green
}

Ensure-ElevatedForDependencyInstall
Ensure-WSL
Ensure-Docker
Ensure-EnvFile
Start-Stack
Show-Status

if (-not $NoOpen) {
  $webPort = (Get-Content $EnvFile | Where-Object { $_ -match '^WEB_PORT=' } | Select-Object -First 1) -replace '^WEB_PORT=', ''
  Start-Process "http://localhost:$webPort"
}
