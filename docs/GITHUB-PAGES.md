# GitHub Pages Yayin Rehberi

Bu repo iki ayri parcadan olusur:

- Urun uygulamasi: repo kokundeki `index.html` ve Docker dosyalari
- Web sitesi: `website`, `downloads`, `docs`

GitHub Pages kesinlikle repo kokunu dogrudan yayinlamamalidir. Aksi halde pazarlama sitesi yerine urun uygulamasi acilir.

## Dogru yayin sekli

Bu repo `.github/workflows/pages.yml` ile GitHub Pages artifact yayinlar.

Workflow su klasorleri yayin paketine koyar:

- `website` icerigi site kokune
- `downloads` klasoru `/downloads`
- `docs` klasoru `/docs`
- `CNAME` dosyasi site kokune

## GitHub ayari

GitHub reposunda:

1. `Settings` bolumune girin.
2. `Pages` ekranini acin.
3. `Build and deployment` alaninda source olarak `GitHub Actions` secin.
4. Custom domain alaninda `argeka.com.tr` gorunmeli.
5. DNS dogrulaninca `Enforce HTTPS` aktif edin.

## DNS kayitlari

Kok domain icin `A` kayitlari:

```text
@  A  185.199.108.153
@  A  185.199.109.153
@  A  185.199.110.153
@  A  185.199.111.153
```

`www` icin:

```text
www  CNAME  EnsarKarayel.github.io
```

DNS yayilmasi birkac dakika ile 24 saat arasi surebilir.

## Kontrol adresleri

```text
https://argeka.com.tr/
https://argeka.com.tr/en/
https://argeka.com.tr/download.html
https://argeka.com.tr/en/download.html
https://argeka.com.tr/downloads/ARGEKA-Sync-Setup.exe
```
