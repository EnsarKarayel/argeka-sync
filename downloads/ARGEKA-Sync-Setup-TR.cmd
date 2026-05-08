@echo off
setlocal
title ARGEKA Sync Kurulum
echo ARGEKA Sync Turkce kurulum baslatiliyor...
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; $p=Join-Path $env:TEMP 'argeka-sync-bootstrap.ps1'; Invoke-WebRequest -UseBasicParsing -Uri 'https://raw.githubusercontent.com/EnsarKarayel/argeka-sync/main/bootstrap.ps1' -OutFile $p; & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $p -Lang tr"
echo.
echo Kurulum bitti. Tarayici acilmadiysa http://localhost:8080 adresini acin.
pause
