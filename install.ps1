param(
  [switch]$SkipDependencyInstall,
  [switch]$NoOpen,
  [ValidateSet("tr", "en")]
  [string]$Lang = "tr"
)

$ErrorActionPreference = "Stop"
$InstallerPath = $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ComposeFile = Join-Path $RepoRoot "deployment\self-hosted\docker-compose.yml"
$EnvFile = Join-Path $RepoRoot ".env"
$EnvExample = Join-Path $RepoRoot ".env.example"

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
    Write-Step (T "Kurulum icin yonetici izni isteniyor" "Administrator permission is required for setup")
    $arguments = @("-ExecutionPolicy", "Bypass", "-File", "`"$InstallerPath`"")
    if ($NoOpen) {
      $arguments += "-NoOpen"
    }
    $arguments += @("-Lang", $Lang)

    Start-Process powershell.exe -Verb RunAs -ArgumentList $arguments
    exit
  }
}

function Install-WithWinget($Id, $Name) {
  if ($SkipDependencyInstall) {
    throw (T "$Name bulunamadi. -SkipDependencyInstall kullanildigi icin otomatik kurulum atlandi." "$Name was not found. Automatic installation was skipped because -SkipDependencyInstall was used.")
  }

  if (-not (Test-Command "winget")) {
    throw (T "winget bulunamadi. Lutfen once Microsoft App Installer/winget kurun veya $Name uygulamasini elle kurun." "winget was not found. Please install Microsoft App Installer/winget first, or install $Name manually.")
  }

  Write-Step (T "$Name kuruluyor" "Installing $Name")
  winget install --exact --id $Id --accept-package-agreements --accept-source-agreements
}

function Ensure-WSL {
  if (Test-WslReady) {
    return
  }

  if ($SkipDependencyInstall) {
    throw (T "WSL hazir degil. Docker Desktop icin WSL gerekli olabilir." "WSL is not ready. Docker Desktop may need WSL.")
  }

  Write-Step (T "WSL altyapisi kuruluyor" "Installing WSL")
  wsl --install --no-distribution
  Write-Host (T "WSL kurulumu yeniden baslatma isteyebilir. Yeniden baslatma gerekirse setup dosyasini tekrar calistirin." "WSL may ask for a restart. If that happens, restart the computer and run the setup file again.") -ForegroundColor Yellow
}

function Ensure-Docker {
  if (-not (Test-Command "docker")) {
    Install-WithWinget "Docker.DockerDesktop" "Docker Desktop"
    $dockerCli = Join-Path $env:ProgramFiles "Docker\Docker\resources\bin"
    $env:Path = "$dockerCli;$env:Path"
  }

  if (-not (Test-Command "docker")) {
    throw (T "Docker komutu bulunamadi. Docker Desktop kurulduysa bilgisayari yeniden baslatin ve setup dosyasini tekrar calistirin." "Docker was not found. If Docker Desktop was installed, restart the computer and run the setup file again.")
  }

  try {
    docker info | Out-Null
    return
  } catch {
    $dockerDesktop = Join-Path $env:ProgramFiles "Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerDesktop) {
      Write-Step (T "Docker Desktop baslatiliyor" "Starting Docker Desktop")
      Start-Process -FilePath $dockerDesktop -WindowStyle Hidden
    }
  }

  Write-Step (T "Docker motoru bekleniyor" "Waiting for Docker engine")
  for ($i = 1; $i -le 36; $i++) {
    try {
      docker info | Out-Null
      return
    } catch {
      Start-Sleep -Seconds 5
    }
  }

  throw (T "Docker Desktop hazir olmadi. Uygulamayi acip Linux engine hazir olduktan sonra setup dosyasini tekrar calistirin." "Docker Desktop is not ready yet. Open Docker Desktop, wait for the Linux engine, then run the setup file again.")
}

function Ensure-EnvFile {
  if (-not (Test-Path $EnvFile)) {
    Copy-Item -Path $EnvExample -Destination $EnvFile
    Write-Host (T ".env olusturuldu. Canli ortamda POSTGRES_PASSWORD degerini degistirin." ".env was created. For production use, change POSTGRES_PASSWORD.") -ForegroundColor Yellow
  }
}

function Start-Stack {
  Write-Step (T "ARGEKA Sync Docker servisleri baslatiliyor" "Starting ARGEKA Sync Docker services")
  Push-Location $RepoRoot
  try {
    docker compose --env-file $EnvFile -f $ComposeFile up -d --build
  } finally {
    Pop-Location
  }
}

function Show-Status {
  Write-Step (T "Servis durumu" "Service status")
  docker compose --env-file $EnvFile -f $ComposeFile ps
  Write-Host ""
  Write-Host "Web: http://localhost:$((Get-Content $EnvFile | Where-Object { $_ -match '^WEB_PORT=' } | Select-Object -First 1) -replace '^WEB_PORT=', '')" -ForegroundColor Green
  Write-Host (T "Panel otomatik acilir; kullanici adi ve sifre gerekmez." "The panel opens automatically; no username or password is required.") -ForegroundColor Green
}

function Find-CSharpCompiler {
  $candidates = @(
    (Join-Path $env:WINDIR "Microsoft.NET\Framework64\v4.0.30319\csc.exe"),
    (Join-Path $env:WINDIR "Microsoft.NET\Framework\v4.0.30319\csc.exe")
  )

  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  return $null
}

function Ensure-DesktopLauncher {
  $desktop = [Environment]::GetFolderPath("Desktop")
  if (-not $desktop) {
    Write-Host (T "Masaustu yolu bulunamadi, EXE olusturma atlandi." "Desktop folder was not found. EXE creation was skipped.") -ForegroundColor Yellow
    return
  }

  $launcherPath = Join-Path $desktop "ARGEKA Sync.exe"
  $iconPath = Join-Path $RepoRoot "assets\icons\argeka-sync.ico"
  $repoLiteral = $RepoRoot.Replace('"', '""')
  $source = @"
using System;
using System.Diagnostics;
using System.IO;

public static class ArgekaSyncLauncher {
  [STAThread]
  public static void Main() {
    string repo = @"$repoLiteral";
    string script = Path.Combine(repo, "start.ps1");
    if (!File.Exists(script)) {
      Process.Start(new ProcessStartInfo("https://github.com/EnsarKarayel/argeka-sync") { UseShellExecute = true });
      return;
    }

    ProcessStartInfo psi = new ProcessStartInfo("powershell.exe");
    psi.Arguments = "-ExecutionPolicy Bypass -File \"" + script + "\"";
    psi.WorkingDirectory = repo;
    psi.UseShellExecute = false;
    psi.CreateNoWindow = true;
    psi.WindowStyle = ProcessWindowStyle.Hidden;
    Process.Start(psi);
  }
}
"@

  try {
    if (Test-Path $launcherPath) {
      Remove-Item -LiteralPath $launcherPath -Force
    }

    $compiler = Find-CSharpCompiler
    if ($compiler -and (Test-Path $iconPath)) {
      $sourcePath = Join-Path $env:TEMP "ArgekaSyncLauncher.cs"
      [IO.File]::WriteAllText($sourcePath, $source, [Text.UTF8Encoding]::new($false))
      & $compiler @(
        "/nologo",
        "/target:winexe",
        "/out:$launcherPath",
        "/win32icon:$iconPath",
        "/reference:System.dll",
        $sourcePath
      )

      if ($LASTEXITCODE -ne 0) {
        throw "C# derleyici EXE olustururken hata kodu dondurdu: $LASTEXITCODE"
      }
    } else {
      Add-Type -TypeDefinition $source -OutputAssembly $launcherPath -OutputType WindowsApplication -ReferencedAssemblies "System.dll"
    }
    Write-Host (T "Masaustu uygulamasi: $launcherPath" "Desktop app: $launcherPath") -ForegroundColor Green
  } catch {
    Write-Host (T "Masaustu EXE olusturulamadi: $($_.Exception.Message)" "Desktop EXE could not be created: $($_.Exception.Message)") -ForegroundColor Yellow
  }
}

Ensure-ElevatedForDependencyInstall
Ensure-WSL
Ensure-Docker
Ensure-EnvFile
Start-Stack
Show-Status
Ensure-DesktopLauncher

if (-not $NoOpen) {
  $webPort = (Get-Content $EnvFile | Where-Object { $_ -match '^WEB_PORT=' } | Select-Object -First 1) -replace '^WEB_PORT=', ''
  Start-Process "http://localhost:$webPort"
}
