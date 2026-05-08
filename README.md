# ARGEKA Sync

ARGEKA Sync, teknik ekipler icin hazirlanan self-hosted mini ETL ve veritabani aktarim aracidir. Amac tek yonlu veri akislarini kolayca kurmak, zamanlamak ve izlemektir.

Ilk calisan motor PostgreSQL -> PostgreSQL ve internal demo baglantisidir. MSSQL, MySQL/MariaDB, Oracle, SQLite, ODBC, CSV/Excel, REST API, SAP HANA ve Firebird connector mimarisi arayuzde hazirdir; bu baglantilar icin driver/ODBC calisma motoru sonraki fazlarda eklenecektir.

## Ne ise yarar?

- Kaynak veritabanindan parametreli SQL sorgusu calistirir.
- Sonucu hedef veritabaninda tabloya insert eder.
- Kolon esleme yapar: kaynak kolon -> hedef kolon.
- Kolon veya veri hatasi icin politika belirler: strict, ignore extra, skip row, quarantine.
- Manuel, saatlik, gunluk veya haftalik calisma plani tutar.
- Her calisma icin okunan, yazilan, atlanan satir ve hata logu kaydeder.
- Self-hosted calisir; veritabani sifreleri ve veriler kullanicinin kendi makinesi/sunucusunda kalir.

## Tek komut Windows kurulumu

Hiç teknik bilmeyen kullanıcı için adım adım kurulum rehberi:

- [docs/KURULUM.md](docs/KURULUM.md)
- GitHub üzerinde açmak için: https://github.com/EnsarKarayel/akis-crm/blob/main/docs/KURULUM.md

Sifir bir Windows bilgisayarda PowerShell acip su komutu calistirin:

```powershell
powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/EnsarKarayel/akis-crm/main/bootstrap.ps1 | iex"
```

Bu komut Git yoksa kurmayi dener, repo'yu `Desktop\ARGEKA-Sync` klasorune indirir, Docker Desktop'i kontrol eder ve ARGEKA Sync servislerini baslatir.

Repo zaten bilgisayardaysa:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

Sonraki acilislarda:

```powershell
.\start.ps1
```

Servisleri durdurmak icin:

```powershell
.\stop.ps1
```

Kurulumdan sonra:

```text
http://localhost:8080
```

Demo girisi:

```text
admin@akis-crm.local / admin123
```

## Ilk demo aktarim

Kurulumla birlikte bir demo PostgreSQL kaynak ve hedef baglantisi gelir.

1. `http://localhost:8080` adresinde giris yapin.
2. `Aktarim Isleri` ekranina gidin.
3. `Demo PostgreSQL -> PostgreSQL aktarim` isini secin.
4. `Calistir` butonuna basin.
5. `Calisma Gecmisi` ekraninda okunan/yazilan satirlari gorun.

Demo kaynak tablo: `sync_demo_source`

Demo hedef tablo: `sync_demo_target`

## Moduller

- `Dashboard`: connector durumu, son run ve mini ETL akisi.
- `Baglantilar`: kaynak/hedef DB connector tanimlari.
- `Sorgular`: parametreli SQL sorgulari.
- `Aktarim Isleri`: sorgu, hedef tablo, yazma modu, hata politikasi ve zamanlama.
- `Kolon Esleme`: kaynak-hedef kolon haritasi, default deger ve transform.
- `Zamanlama`: manuel/saatlik/gunluk/haftalik calisma planlari.
- `Calisma Gecmisi`: run status, okunan/yazilan/atlanan satirlar.
- `Yonetim`: kullanici, kurulum sagligi ve lisans altyapisi.

## Desteklenen yazma modlari

- `insert_only`: Gelen satirlari hedef tabloya insert eder.
- `skip_duplicates`: Hedefte unique conflict olursa satiri atlar.
- `truncate_reload`: Hedef tabloyu temizler ve yeniden yukler.

## Kolon hatasi politikalari

- `strict`: Zorunlu kolon yoksa isi durdurur.
- `ignore_extra`: Kaynaktaki fazla kolonlari yok sayar.
- `skip_row`: Sorunlu satiri atlar, kalan satirlara devam eder.
- `quarantine`: Sorunlu satiri log metadata alanina yazip atlar.

## Parametreler

Sorgularda `:parametre_adi` formati kullanilir.

Ornek:

```sql
select customer_code, customer_name, city, balance
from sync_demo_source
where updated_at >= :last_run_at
order by id
```

Parametre JSON:

```json
{
  "last_run_at": "2000-01-01T00:00:00Z",
  "firma_kodu": "001"
}
```

## Yedek ve geri yukleme

Veritabani yedegi almak icin:

```powershell
powershell -ExecutionPolicy Bypass -File .\backup.ps1
```

Yedegi geri yuklemek icin:

```powershell
powershell -ExecutionPolicy Bypass -File .\restore.ps1 -BackupFile .\backups\argeka-crm-YYYYMMDD-HHMMSS.sql
```

## Self-hosted Docker

Elle calistirmak icin:

```powershell
docker compose --env-file .env -f deployment/self-hosted/docker-compose.yml up -d --build
```

Servisler:

- Web: `http://localhost:8080`
- API: `http://localhost:3000/health`
- DB: PostgreSQL Docker volume

## Urun stratejisi

ARGEKA Sync simdilik ucretsiz beta/self-hosted urun olarak dusunulmustur. SaaS degil; cunku hedef kullanici sirket veritabani sifrelerini ve verilerini kendi ortaminda tutmak ister.

Sonraki fazlar:

- MSSQL driver/ODBC runtime.
- MySQL/MariaDB driver.
- Oracle Instant Client/ODBC dokumantasyonu.
- Windows EXE installer.
- Ayrintili scheduler worker.
- Hata satirlari icin quarantine tablosu.
- Upsert anahtar secimi.
- Tanitim ve indirme web sayfasi.
