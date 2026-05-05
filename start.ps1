param(
  [switch]$NoOpen
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$argsList = @("-ExecutionPolicy", "Bypass", "-File", (Join-Path $RepoRoot "install.ps1"), "-SkipDependencyInstall")
if ($NoOpen) {
  $argsList += "-NoOpen"
}

& powershell.exe @argsList
