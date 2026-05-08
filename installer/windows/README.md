# ARGEKA Sync Windows Installer

Bu klasor, ileride imzali `ARGEKA-Sync-Setup.exe` uretmek icin hazirlandi.

Simdiki dagitim dosyasi:

- `downloads/ARGEKA-Sync-Install.cmd`

EXE uretimi icin onerilen yol:

1. Inno Setup kurun.
2. `ARGEKA-Sync-Setup.iss` dosyasini acin.
3. `Compile` secin.
4. Cikan `ARGEKA-Sync-Setup.exe` dosyasini web sitesindeki indirme klasorune koyun.
5. Yayindan once dosyayi kod imzalama sertifikasi ile imzalayin.

Kod imzalama olmadan indirilen EXE dosyalari Windows SmartScreen tarafinda uyari verebilir.
