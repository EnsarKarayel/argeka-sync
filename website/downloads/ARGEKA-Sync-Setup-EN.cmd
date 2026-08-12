@echo off
setlocal
title ARGEKA Sync Setup
echo Starting ARGEKA Sync setup in English...
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; $u='https://raw.githubusercontent.com/EnsarKarayel/argeka-sync/main/bootstrap.ps1'; $p=Join-Path $env:TEMP 'argeka-sync-bootstrap.ps1'; if (Get-Command curl.exe -ErrorAction SilentlyContinue) { & curl.exe -L --fail -o $p $u; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } } else { Invoke-WebRequest -UseBasicParsing -Uri $u -OutFile $p }; & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $p -Lang en"
echo.
echo Setup finished. If the browser did not open, go to http://localhost:8080
pause
