# ARGEKA Sync AdSense Hazirligi

Bu repo AdSense icin hazirlik durumundadir, fakat yayina alinacak gercek reklam kodu icin Google AdSense hesabindaki `ca-pub-...` yayinlayici kimligi gerekir.

## Hazir olanlar

- `website/ads.txt` dosyasi GitHub Pages yayininin kokune kopyalanir.
- Gizlilik sayfalarinda reklam ve cerez kullanimi icin aciklama bulunur.
- Indirme sayfasi otomatik indirme baslatmaz; kullanici setup dosyasini kendi tiklar.
- Destek, sartlar, gizlilik, dil gecisi, canonical ve sitemap dosyalari hazirdir.

## AdSense onayi gelince yapilacaklar

1. Google AdSense hesabinda siteyi `https://argeka.com.tr` olarak ekleyin.
2. Google'in verdigi yayinlayici kimligini not edin.
3. `website/ads.txt` icindeki ornek satiri su formata cevirin:

```text
google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
```

4. `pub-0000000000000000` yerine kendi yayinlayici kimliginizi yazin.
5. Reklam kodu eklenecekse once ana sayfada bir adet icerik arasi yerlesimle baslayin. Indirme butonunun hemen ustune reklam koymayin.
6. Degisiklikleri commit edip GitHub'a push edin. GitHub Pages yayini otomatik gunceller.

## Yerlesim kurali

Reklamlar indirme butonunu gizlememeli, kullaniciyi yaniltmamali ve otomatik indirme etkisi olusturmamalidir. Kurulum dosyasi her zaman kullanicinin bilincli tiklamasiyla indirilmelidir.
