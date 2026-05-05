# ARGEKA CRM Self-hosted

Bu paket ARGEKA CRM web, API ve PostgreSQL servislerini tek Docker Compose dosyasi ile calistirir.

## Kurulum

Windows icin onerilen tek komut:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

Sifir bilgisayarda repo'yu da otomatik indirmek icin:

```powershell
powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/EnsarKarayel/akis-crm/main/bootstrap.ps1 | iex"
```

Elle Docker Compose calistirmak icin:

```powershell
docker compose -f deployment/self-hosted/docker-compose.yml up -d --build
```

Tarayicida ac:

```text
http://localhost:8080
```

## Sunucu kurulumu

1. Ubuntu veya Oracle Linux sunucu hazirla.
2. Docker ve Docker Compose kur.
3. Repo'yu sunucuya cek.
4. `docker compose -f deployment/self-hosted/docker-compose.yml up -d --build` calistir.
5. Domain icin Nginx Proxy Manager, Caddy veya certbot ile SSL ekle.

API kontrolu:

```text
http://localhost:3000/health
```

## Yedekleme ve aktarim

```powershell
powershell -ExecutionPolicy Bypass -File .\backup.ps1
powershell -ExecutionPolicy Bypass -File .\restore.ps1 -BackupFile .\backups\argeka-crm-YYYYMMDD-HHMMSS.sql
powershell -ExecutionPolicy Bypass -File .\transfer.ps1 -Format csv
```

Yonetim ekraninda manuel kullanici olusturma, rol/veri kapsami atama, kolon gizleme, lisans aktivasyonu ve JSON/CSV/SQL dis aktarim vardir.

## Sonraki faz

- `akis-crm-worker`: mail/takvim/webhook kuyrugu
- Lisans aktivasyon servisinin online dogrulama merkezi
- SSL ve domain otomasyonu

