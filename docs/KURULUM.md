# ARGEKA Sync Kurulum Rehberi

Bu rehber, ARGEKA Sync'i baska bir Windows bilgisayara kurmak isteyen ve teknik kurulumlara alisik olmayan kisiler icindir.

## Kisa cevap

Windows bilgisayarda PowerShell acin ve su komutu calistirin:

```powershell
powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/EnsarKarayel/akis-crm/main/bootstrap.ps1 | iex"
```

Kurulum bittiginde tarayicida su adres acilir:

```text
http://localhost:8080
```

Demo girisi:

```text
E-posta: admin@akis-crm.local
Sifre: admin123
```

## Bu program ne kurar?

- ARGEKA Sync web paneli
- Node.js API servisi
- PostgreSQL veritabani
- Docker uzerinde kalici veri alani
- Demo PostgreSQL kaynak/hedef aktarim isi
- PostgreSQL ve MSSQL icin calisan aktarim motoru
- Saatlik, gunluk ve haftalik isleri calistiran scheduler worker

## Kurulumdan once

- Windows bilgisayar gerekir.
- Docker Desktop gerekir. Kurulum komutu kontrol eder ve eksikse sizi yonlendirir.
- Ilk Docker/WSL kurulumunda bilgisayar yeniden baslatma isteyebilir.
- Yeniden baslatma olursa ayni komutu tekrar calistirin.
- Docker Desktop acildiginda GitHub ile giris yapmak zorunlu degildir; `Skip` secilebilir.

## Yontem 1: Tek komutla kurulum

1. Windows arama kutusuna `PowerShell` yazin.
2. PowerShell'i acin.
3. Asagidaki komutu tek parca halinde yapistirin.

```powershell
powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/EnsarKarayel/akis-crm/main/bootstrap.ps1 | iex"
```

4. Ekranda izin veya onay sorarsa kabul edin.
5. Docker kurulumu baslarsa bitmesini bekleyin.
6. Yeniden baslatma isterse bilgisayari yeniden baslatin.
7. Yeniden baslatmadan sonra ayni komutu tekrar calistirin.
8. Kurulum bittiginde `http://localhost:8080` adresine gidin.

## Yontem 2: GitHub'dan indirerek kurulum

1. Tarayicida su adrese gidin:

```text
https://github.com/EnsarKarayel/akis-crm
```

2. Yesil `Code` butonuna basin.
3. `Download ZIP` secenegine basin.
4. ZIP dosyasini indirin.
5. ZIP dosyasini masaustune cikarin.
6. Cikan klasorun icine girin.
7. Bos bir alana sag tiklayip `Terminalde ac` veya `PowerShell penceresini burada ac` secin.
8. Su komutu calistirin:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

9. Kurulum bittiginde su adresi acin:

```text
http://localhost:8080
```

## Sonraki acilislarda

Programi tekrar baslatmak icin proje klasorunde:

```powershell
.\start.ps1
```

Programi durdurmak icin:

```powershell
.\stop.ps1
```

## Ilk test

1. `http://localhost:8080` adresine girin.
2. `admin@akis-crm.local / admin123` ile oturum acin.
3. `Aktarim Isleri` ekranina gidin.
4. `Demo PostgreSQL -> PostgreSQL aktarim` isinde `Calistir` butonuna basin.
5. `Calisma Gecmisi` ekraninda `completed`, `3 okunan`, `3 yazilan` benzeri sonucu gorun.

Bu sonuc gorunuyorsa kurulum basarilidir.

## Veriler nerede duruyor?

Veriler Docker icindeki PostgreSQL volume alaninda tutulur. Tarayiciyi kapatmak verileri silmez.

Yedek almak icin:

```powershell
powershell -ExecutionPolicy Bypass -File .\backup.ps1
```

Yedekler `backups` klasorune gelir.

## Baska bilgisayara tasima

1. Eski bilgisayarda yedek alin:

```powershell
powershell -ExecutionPolicy Bypass -File .\backup.ps1
```

2. Yeni bilgisayarda ARGEKA Sync kurulumunu yapin.
3. Eski bilgisayardaki son `.sql` yedek dosyasini yeni bilgisayardaki `backups` klasorune koyun.
4. Yeni bilgisayarda proje klasorunde su komutu calistirin:

```powershell
powershell -ExecutionPolicy Bypass -File .\restore.ps1 -BackupFile .\backups\yedek-dosyasi.sql
```

`yedek-dosyasi.sql` yerine kendi dosya adinizi yazin.

## Sik karsilasilan durumlar

### Docker Desktop acilmadi

Docker Desktop'i Baslat menusunden acin. Tam acilmasini bekleyin. Sonra:

```powershell
.\start.ps1
```

### Bilgisayar yeniden baslatma istedi

Yeniden baslatin. Sonra kurulum komutunu tekrar calistirin.

### Sayfa acilmiyor

Proje klasorunde:

```powershell
.\start.ps1
```

Ardindan tarayicida:

```text
http://localhost:8080
```

### API calisiyor mu?

Tarayicida su adresi acin:

```text
http://localhost:3000/health
```

`ok: true` benzeri cevap varsa API calisiyor.

## Kurulum kontrol listesi

- `http://localhost:8080` aciliyor mu?
- Demo kullanici ile giris oluyor mu?
- Dashboard gorunuyor mu?
- Baglantilar ekraninda demo kaynak/hedef baglantilar var mi?
- Aktarim Isleri ekraninda demo is var mi?
- Demo isi calisinca Calisma Gecmisi'nde completed gorunuyor mu?

Bu maddeler tamamsa ARGEKA Sync kullanima hazirdir.
