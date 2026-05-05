# Akis CRM Self-hosted

Bu paket statik prototipi Nginx ile calistirir. Canli urunde ayni klasore API ve PostgreSQL servisleri eklenecek.

## Kurulum

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

## Sonraki faz

- `akis-crm-api`: backend servis
- `akis-crm-db`: PostgreSQL servis
- `akis-crm-worker`: mail/takvim/webhook kuyrugu
- Lisans aktivasyon servisi
