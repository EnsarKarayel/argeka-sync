@echo off
setlocal
title ARGEKA Sync Installer
echo ARGEKA Sync Windows kurulumu baslatiliyor...
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/EnsarKarayel/argeka-sync/main/bootstrap.ps1 | iex"
echo.
echo Kurulum penceresi kapandiysa http://localhost:8080 adresini acabilirsiniz.
pause
