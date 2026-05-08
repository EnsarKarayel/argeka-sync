@echo off
setlocal
title ARGEKA Sync Setup
echo Starting ARGEKA Sync setup in English...
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; $p=Join-Path $env:TEMP 'argeka-sync-bootstrap.ps1'; Invoke-WebRequest -UseBasicParsing -Uri 'https://raw.githubusercontent.com/EnsarKarayel/argeka-sync/main/bootstrap.ps1' -OutFile $p; & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $p -Lang en"
echo.
echo Setup finished. If the browser did not open, go to http://localhost:8080
pause
