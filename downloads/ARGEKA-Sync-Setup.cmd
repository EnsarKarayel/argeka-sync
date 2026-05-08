@echo off
setlocal
title ARGEKA Sync Setup
echo ARGEKA Sync Setup
echo.
echo Dil secin / Choose language
echo 1 - Turkce
echo 2 - English
set /p CHOICE=Secim / Choice [1]: 
if "%CHOICE%"=="2" (
  set LANG=en
) else (
  set LANG=tr
)
echo.
echo Setup dosyalari indiriliyor...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$p=Join-Path $env:TEMP 'argeka-sync-bootstrap.ps1'; Invoke-WebRequest -UseBasicParsing -Uri 'https://raw.githubusercontent.com/EnsarKarayel/argeka-sync/main/bootstrap.ps1' -OutFile $p; & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $p -Lang %LANG%"
echo.
echo Kurulum bitti. Tarayici acilmadiysa / If browser did not open:
echo http://localhost:8080
pause
