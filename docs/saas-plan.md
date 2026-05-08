# ARGEKA Sync SaaS Plani

## Faz 1

- IndexedDB ile tarayicida kalici veri
- PWA manifest, favicon, Apple Home Screen metalar
- Pipeline, toplantilar, takvim, e-posta ve entegrasyon ekranlari
- JSON ve ICS ciktilari

## Faz 2

- PostgreSQL semasi: `db/schema.sql`
- Backend API: tenant, user, opportunity, meeting, calendar event, OAuth connection
- Stripe veya iyzico abonelik
- Google OAuth ve Microsoft Entra OAuth
- Tokenlari KMS veya uygulama seviyesinde sifreli saklama

## Faz 3

- Gmail API: e-posta okuma, etiketleme, firsata donusturme
- Google Calendar API: event list/insert
- Microsoft Graph: Outlook mail ve calendar event list/create
- Webhook inbound/outbound ve ERP entegrasyonu
- iOS PWA + ICS + push bildirim stratejisi

## En kritik urun kararlari

- CRM ilk ekrani pipeline olmali; SaaS kullanicisi isi oradan yurutur.
- Takvim, toplantinin yaninda degil ana modul olmali.
- Gmail/Outlook izinleri minimum scope ile baslamali.
- Multi-tenant izolasyon backend tarafinda zorunlu olmali.
- Urun sadece cloud degil; self-hosted server ve desktop paketleri de ayni kod tabanindan cikmali.
- Ilk gelir icin self-hosted kurulum + yillik bakim daha dusuk operasyon maliyeti tasir.
