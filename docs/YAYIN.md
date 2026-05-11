# ARGEKA Sync Web Yayini

Bu notlar, indirme sitesini yayina almak icin hazirlandi.

## Google Ads icin hedef sayfa

Reklam final URL'i dogrudan kurulum dosyasi olmamalidir. Google Ads hedef sayfanin calisir, gezilebilir, guvenli ve kullaniciya bilgi veren bir sayfa olmasini ister. Dosya indirme ancak kullanici butona bastiktan sonra baslamalidir.

Turkce reklam final URL:

```text
https://argeka.com.tr/download.html
```

Ingilizce reklam final URL:

```text
https://argeka.com.tr/en/download.html
```

Bu sayfa:

- Otomatik indirme baslatmaz.
- Urun aciklamasi ve sistem gereksinimi gosterir.
- Setup'in kullanicinin kendi bilgisayarinda calistigini aciklar.
- Turkce/English dil gecisi sunar.
- Gizlilik, sartlar ve destek sayfalarina baglanti verir.
- HTTP 200 ile erisilebilir olmalidir.
- Mobil ve masaustu tarayicilarda calismalidir.
- Google AdsBot tarafindan taranabilir olmalidir.

Reklamda kullanilabilecek guvenli mesaj ornekleri:

- Self-hosted database sync tool
- Veritabani aktarimlarini kendi sunucunuzda calistirin
- PostgreSQL, MSSQL ve MySQL icin zamanlanabilir aktarim

Kacinilacaklar:

- Final URL'i `downloads/ARGEKA-Sync-Setup.exe` yapmayin.
- Sayfa acilir acilmaz indirme baslatmayin.
- Sitede olmayan ozellikleri reklam metnine yazmayin.
- Destek, gizlilik ve sartlar sayfalarini yayindan kaldirmayin.

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
3. Canonical URL ve sitemap `https://argeka.com.tr` icin hazirlandi; farkli domain kullanilmayacaksa degistirmeyin.
4. Google Search Console'a `sitemap.xml` gonderin.
5. Google Ads'te final URL olarak domain altindaki `download.html` sayfasini kullanin.

## ads.txt

`website/ads.txt` simdilik hazirlik dosyasidir. AdSense hesabi acildiginda Google'in verdigi satir eklenmelidir.
