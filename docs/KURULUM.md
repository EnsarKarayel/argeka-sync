# ARGEKA CRM Kurulum Rehberi

Bu rehber, ARGEKA CRM'i baska bir Windows bilgisayara kurmak isteyen ve teknik kurulumlara alisik olmayan kisiler icindir.

## Kisa cevap

En kolay kurulum icin Windows bilgisayarda PowerShell acin ve su komutu calistirin:

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

## Kurulumdan once bilinmesi gerekenler

- Bu kurulum Windows bilgisayar icindir.
- Docker Desktop gerekir. Kurulum komutu Docker'i kontrol eder, eksikse sizi yonlendirir.
- Ilk Docker/WSL kurulumunda bilgisayar yeniden baslatma isteyebilir.
- Bilgisayar yeniden baslatilirsa ayni komutu tekrar calistirin.
- Docker Desktop acildiginda GitHub ile giris yapmak zorunlu degildir; "Skip" secilebilir.

## Yontem 1: Tek komutla kurulum

1. Windows arama kutusuna `PowerShell` yazin.
2. PowerShell'i acin.
3. Asagidaki komutu tek parca halinde yapistirin.

```powershell
powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/EnsarKarayel/akis-crm/main/bootstrap.ps1 | iex"
```

4. Ekranda izin veya onay sorarsa kabul edin.
5. Docker kurulumu baslarsa kurulumun bitmesini bekleyin.
6. Yeniden baslatma isterse bilgisayari yeniden baslatin.
7. Yeniden baslatmadan sonra ayni komutu tekrar calistirin.
8. Kurulum bittiginde `http://localhost:8080` adresine gidin.

## Yontem 2: GitHub'dan indirerek kurulum

Bu yontem, komutla indirme calismazsa veya repo dosyalarini elle gormek isterseniz kullanilir.

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

Programi tekrar calistirmak icin proje klasorunde PowerShell acip:

```powershell
.\start.ps1
```

Programi durdurmak icin:

```powershell
.\stop.ps1
```

## Veriler nerede duruyor?

Veriler PostgreSQL veritabaninda Docker volume icinde tutulur. Yani tarayiciyi kapatmak verileri silmez.

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

2. Yeni bilgisayarda kurulumu yapin.
3. Eski bilgisayardaki `backups` klasorunden son `.sql` dosyasini yeni bilgisayara kopyalayin.
4. Yeni bilgisayarda proje klasorunde su komutu calistirin:

```powershell
powershell -ExecutionPolicy Bypass -File .\restore.ps1 -BackupFile .\backups\yedek-dosyasi.sql
```

`yedek-dosyasi.sql` yerine kendi dosya adinizi yazin.

## Sik karsilasilan durumlar

### Docker Desktop acilmadi

Docker Desktop'i Baslat menusunden acin. Tam acilmasini bekleyin. Sonra tekrar:

```powershell
.\start.ps1
```

### Bilgisayar yeniden baslatma istedi

Yeniden baslatin. Sonra kurulum komutunu tekrar calistirin.

### Sayfa acilmiyor

Once Docker'in calistigindan emin olun. Sonra proje klasorunde:

```powershell
.\start.ps1
```

Ardindan tarayicida:

```text
http://localhost:8080
```

### API calisiyor mu kontrol etmek

Tarayicida su adresi acin:

```text
http://localhost:3000/health
```

Ekranda `ok: true` benzeri bir cevap gorurseniz API calisiyor demektir.

## Kurulumdan sonra ilk kontrol listesi

- `http://localhost:8080` aciliyor mu?
- `admin@akis-crm.local / admin123` ile giris oluyor mu?
- Pipeline ekrani geliyor mu?
- Musteriler, Teklifler, Gorevler ve Entegrasyon ekranlari gorunuyor mu?
- Yonetim ekraninda lisans ve kullanici bilgileri gorunuyor mu?

Bu maddeler tamamsa kurulum basarilidir.
