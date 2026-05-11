# ARGEKA Sync Kullanim Kilavuzu

Bu kilavuz ilk kullanim icindir. Teknik terimleri mumkun oldugunca basit tuttuk.

## Programi acma

1. Masaustundeki `ARGEKA Sync.exe` dosyasina cift tiklayin.
2. Tarayici acilir.
3. Acilmazsa tarayiciya `http://localhost:8080` yazin.

## Ilk acilis

Kullanici adi veya sifre yazmaniz gerekmez. ARGEKA Sync yerel oturumu otomatik acar.

Servis henuz hazir degilse ekranda tekrar deneme mesaji gorunur. Docker Desktop aciksa 1-2 dakika bekleyip `Tekrar dene` butonuna basin.

## ARGEKA Sync ne yapar?

ARGEKA Sync bir kaynaktan veri okur ve hedefe yazar.

Ornek:

- Kaynak: Musteri bakiyelerini tutan PostgreSQL veritabani
- Sorgu: `son guncellenen musterileri getir`
- Hedef: Raporlama veritabani
- Zamanlama: Her gun saat 02:00

## Temel ekranlar

### Dashboard

Genel durumu gosterir. Calisan isler, son hatalar ve son aktarimlar burada gorulur.

### Baglantilar

Kaynak ve hedef veritabanlari burada tanimlanir. Bir baglanti kaynak, digeri hedef olabilir.

### Sorgular

Kaynak veritabanindan hangi verinin cekilecegi burada yazilir. Parametreli SQL desteklenir.

### Aktarim Isleri

Hangi sorgunun hangi hedef tabloya yazilacagi burada ayarlanir.

### Calisma Gecmisi

Her aktarimin sonucu burada gorulur. Kac satir okundu, kac satir yazildi, hata oldu mu buradan kontrol edilir.

## Ilk demo aktarimi calistirma

1. `Aktarim Isleri` ekranina girin.
2. Demo PostgreSQL aktarim isini bulun.
3. `Calistir` butonuna basin.
4. `Calisma Gecmisi` ekranina gidin.
5. Sonucun basarili oldugunu kontrol edin.

## Yeni aktarim hazirlarken kararlar

1. Kaynak veritabani hangisi?
2. Hedef veritabani hangisi?
3. Hangi SQL sorgusu calisacak?
4. Hedef tablo adi ne?
5. Kaynak kolonlar hedefte hangi kolonlara gidecek?
6. Kolon eslesmezse ne olacak?
   - Hata ver ve dur
   - Fazla kolonu yok say
   - Sorunlu satiri atla
   - Sorunlu satiri logla
7. Ne zaman calisacak?
   - Manuel
   - Saatlik
   - Gunluk
   - Haftalik

## Guvenli kullanim onerileri

- Once demo aktarimla test edin.
- Canli veritabaninda once kucuk bir sorguyla deneyin.
- Hedef tabloyu bos veya test tablo olarak baslatin.
- Sifreleri paylasmayin.
- Duzenli yedek alin.

## Yardim isterken hazir olsun

Destek isterken su bilgileri hazir olursa sorun daha hizli cozulur:

- Hangi bilgisayarda kurulu?
- Hangi veritabani kullaniliyor?
- Hata hangi ekranda cikti?
- `Calisma Gecmisi` sonucunda ne yaziyor?
- Son yaptiginiz islem neydi?
