# ARGEKA CRM Desktop

Desktop hedefi, ayni web uygulamasini Windows kurulum paketi olarak sunmaktir.

## Paketleme stratejisi

Baslangic onerisi:

- Tauri: daha dusuk RAM ve kucuk installer
- SQLite: tek kullanici ve kucuk ofis verisi
- Local API: ileride offline-first senkronizasyon icin

Alternatif:

- Electron: daha hizli gelistirme, daha buyuk paket boyutu

## Lisans modeli

- Tek cihaz aktivasyon
- Offline lisans dosyasi
- Yillik bakim ve guncelleme anahtari
- Enterprise icin coklu cihaz lisansi

## Fazlar

1. Statik uygulamayi Tauri kabugunda calistir.
2. IndexedDB verisini SQLite'a tasiyacak adapter yaz.
3. Windows installer ve auto-update ekle.
4. Lisans aktivasyon ekranini ekle.

