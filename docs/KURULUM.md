# ARGEKA Sync Kurulum Kilavuzu

Bu rehber teknik olmayan kullanicilar icindir. Amac basit: web sitesinden setup dosyasini indirip kendi bilgisayarinizda ARGEKA Sync calistirmak.

## Once sunu bilin

- ARGEKA Sync bir web sitesine girip kullanilan bulut servis degildir.
- Program sizin bilgisayariniza veya kendi Windows sunucunuza kurulur.
- Veritabani sifreleri ve aktardiginiz veriler sizin ortamda kalir.
- Kurulumdan sonra program tarayicida `http://localhost:8080` adresinde acilir.
- Sonraki acilislarda masaustundeki `ARGEKA Sync.exe` dosyasini kullanirsiniz.

## Gerekenler

- Windows 10 veya Windows 11 bilgisayar
- Internet baglantisi
- Kurulum sirasinda yonetici izni verebilme
- En az 4 GB RAM, tercihen 8 GB

Setup gerekli kontrolleri yapar. Git, Docker Desktop veya WSL eksikse kurulum sizi yonlendirir.

## Web sitesinden kurulum

1. Tarayicida ARGEKA Sync indirme sayfasini acin.
2. `Windows setup indir` butonuna basin.
3. `ARGEKA-Sync-Setup.exe` dosyasi iner.
4. Dosyaya cift tiklayin.
5. Windows guvenlik uyarisi gosterirse `Ek bilgi` ve sonra `Yine de calistir` seceneklerini kullanin. Bu uyari dosya henuz imzali olmadigi icin cikabilir.
6. Dil secimi gelir:
   - `1` Turkce
   - `2` English
7. Kurulum penceresi acik kalsin. Git, Docker Desktop, WSL ve servis kontrolleri otomatik yapilir.
8. Bilgisayar yeniden baslatma isterse yeniden baslatin.
9. Yeniden baslattiktan sonra ayni `ARGEKA-Sync-Setup.exe` dosyasini tekrar calistirin.
10. Kurulum bitince tarayici acilir.

## Programi acma

Kurulumdan sonra masaustunde su dosya olusur:

```text
ARGEKA Sync.exe
```

Programi acmak icin bu dosyaya cift tiklayin. Tarayici acilmazsa kendiniz su adresi yazin:

```text
http://localhost:8080
```

## Ilk giris

Kurulumdan sonra kullanici adi veya sifre yazmaniz gerekmez. Panel yerel oturumu otomatik acar.

Servis henuz hazir degilse ekranda tekrar deneme mesaji gorunur. Docker Desktop aciksa 1-2 dakika bekleyip `Tekrar dene` butonuna basin.

## Ilk test

1. `http://localhost:8080` adresini acin.
2. Panel otomatik acilir.
3. `Baglantilar` ekraninda demo kaynak ve hedef baglantilari gorun.
4. `Aktarim Isleri` ekranina gidin.
5. Demo PostgreSQL aktarim isinde `Calistir` butonuna basin.
6. `Calisma Gecmisi` ekraninda basarili sonuc gorun.

Bu adimlar tamamlanirsa kurulum basarilidir.

## Sik sorulan durumlar

### Docker Desktop acildi ve GitHub girisi sordu

GitHub ile giris yapmak zorunda degilsiniz. `Skip` secilebilir.

### Bilgisayar yeniden baslatma istedi

Yeniden baslatin. Sonra setup dosyasini tekrar calistirin.

### Sayfa acilmiyor

Masaustundeki `ARGEKA Sync.exe` dosyasina tekrar cift tiklayin. Yine acilmazsa tarayicida su adresi yazin:

```text
http://localhost:8080
```

### Programi baska bilgisayara tasimak istiyorum

1. Eski bilgisayarda yedek alin.
2. Yeni bilgisayarda setup dosyasiyla ARGEKA Sync kurun.
3. Yedek dosyasini yeni bilgisayara kopyalayin.
4. Geri yukleme islemini yapin.

Detayli yedek komutlari icin teknik destekten yardim almak daha sagliklidir.

## Kaldirma

Basit kaldirma icin:

1. Docker Desktop'i acin.
2. ARGEKA Sync containerlarini durdurun.
3. Masaustundeki `ARGEKA Sync.exe` dosyasini silin.
4. `Desktop\ARGEKA-Sync` klasorunu silin.

Veritabani volume silinirse kayitlar da silinir. Silmeden once yedek alin.
