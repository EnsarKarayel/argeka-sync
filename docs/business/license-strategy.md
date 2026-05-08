# Lisans Stratejisi

## Hedef

ARGEKA Sync hem cloud hem self-hosted hem desktop calisabilmeli. Lisans sistemi bunu engellemeden gelir kontrolu saglamali.

## Lisans tipleri

- `cloud_subscription`: aylik/yillik abonelik
- `server_license`: domain veya sunucu parmak iziyle yillik lisans
- `desktop_license`: cihaz parmak iziyle tek kullanici lisansi
- `enterprise_license`: ozel sozlesme ve kota

## Aktivasyon

Online aktivasyon:

1. Musteri lisans anahtarini girer.
2. Uygulama aktivasyon API'sine tenant, domain ve cihaz bilgisini yollar.
3. API imzali lisans dosyasi dondurur.
4. Uygulama lisans dosyasini yerelde saklar.

Offline aktivasyon:

1. Uygulama cihaz istegi dosyasi uretir.
2. Musteri dosyayi bize yollar.
3. Biz imzali lisans dosyasi veririz.
4. Uygulama internetsiz calisir.

## Kontrol noktasi

Self-hosted urunde cok agresif kilit koyma. Kurumsal musteri guven ister. Lisans kontrolu sade, sozlesme ve destek yenileme modeli guclu olmali.
