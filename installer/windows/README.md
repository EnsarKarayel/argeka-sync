# ARGEKA Sync Windows Installer

Bu klasor Windows setup uretimi icindir.

Simdiki web dagitim dosyalari:

- `downloads/ARGEKA-Sync-Setup.exe`
- `downloads/ARGEKA-Sync-Setup.cmd`

Basit setup EXE, `SetupLauncher.cs` dosyasindan derlenir. Bu EXE webden `bootstrap.ps1` indirir, dil secimini alir ve kurulumu kullanicinin kendi bilgisayarinda baslatir.

Kurumsal/imzali installer uretimi icin onerilen yol:

1. Inno Setup kurun.
2. `ARGEKA-Sync-Setup.iss` dosyasini acin.
3. `Compile` secin.
4. Cikan `ARGEKA-Sync-Setup.exe` dosyasini web sitesindeki indirme klasorune koyun.
5. Yayindan once dosyayi kod imzalama sertifikasi ile imzalayin.

Kod imzalama olmadan indirilen EXE dosyalari Windows SmartScreen tarafinda uyari verebilir.
