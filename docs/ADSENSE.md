# ARGEKA Sync AdSense

Bu repo AdSense yayinlayici kimligi ile guncellendi.

## Aktif ayarlar

- Yayinci kimligi: `ca-pub-6534346834787678`
- `website/ads.txt` dosyasi GitHub Pages yayininin kokune kopyalanir.
- `ads.txt` icerigi:

```text
google.com, pub-6534346834787678, DIRECT, f08c47fec0942fa0
```

- Auto Ads script'i tum statik HTML sayfalarinin `<head>` bolumune eklendi.
- Gizlilik sayfalarinda reklam ve cerez kullanimi icin aciklama bulunur.
- Indirme sayfasi otomatik indirme baslatmaz; kullanici setup dosyasini kendi tiklar.
- Destek, sartlar, gizlilik, dil gecisi, canonical ve sitemap dosyalari hazirdir.

## Search Console sitemap

Search Console'da site haritasi olarak HTML sayfasi degil, sadece su adres gonderilmelidir:

```text
https://argeka.com.tr/sitemap.xml
```

`download.html` bir urun/indirme sayfasidir; site haritasi olarak gonderilirse Google "Site Haritasi HTML'dir" uyarisi verir.

## Yerlesim kurali

Reklamlar indirme butonunu gizlememeli, kullaniciyi yaniltmamali ve otomatik indirme etkisi olusturmamalidir. Kurulum dosyasi her zaman kullanicinin bilincli tiklamasiyla indirilmelidir.
