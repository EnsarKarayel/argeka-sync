# ARGEKA Sync Web Yayini

Bu notlar, indirme sitesini yayina almak icin hazirlandi.

## Google Ads icin hedef sayfa

Reklam final URL'i dogrudan kurulum dosyasi olmamalidir. Final URL olarak sunu kullanin:

```text
https://alan-adiniz/download.html
```

Bu sayfa:

- Otomatik indirme baslatmaz.
- Urun aciklamasi ve sistem gereksinimi gosterir.
- Gizlilik, sartlar ve destek sayfalarina baglanti verir.
- HTTP 200 ile erisilebilir olmalidir.
- Mobil ve masaustu tarayicilarda calismalidir.

## Docker ile siteyi calistirma

```powershell
docker compose -f deployment/website/docker-compose.yml up -d --build
```

Varsayilan adres:

```text
http://localhost:8090
```

## Domain ve SSL

Gercek yayin icin:

1. Domain DNS A kaydini sunucu IP adresine yonlendirin.
2. Nginx Proxy Manager, Caddy veya Traefik ile HTTPS sertifikasi alin.
3. Canonical URL ve sitemap icindeki `https://argeka.com.tr` degerini kendi domaininizle degistirin.
4. Google Search Console'a `sitemap.xml` gonderin.
5. Google Ads'te final URL olarak domain altindaki `download.html` sayfasini kullanin.

## ads.txt

`website/ads.txt` simdilik hazirlik dosyasidir. AdSense hesabi acildiginda Google'in verdigi satir eklenmelidir.
