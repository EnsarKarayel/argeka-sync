# ARGEKA CRM

Kurulumsuz Ã§alÄ±ÅŸan ilk web CRM prototipi. DosyayÄ± tarayÄ±cÄ±da aÃ§arak pipeline, sÃ¼rÃ¼kle-bÄ±rak fÄ±rsat yÃ¶netimi, e-posta taslak akÄ±ÅŸÄ±, veri gÃ¶nder-al formu ve abonelik taslaÄŸÄ±nÄ± deneyebilirsiniz.

## Calistirma

`index.html` dosyasÄ±nÄ± tarayÄ±cÄ±da aÃ§Ä±n. Node, npm veya sunucu gerekmez. PWA service worker sadece gerÃ§ek `https` veya `localhost` ortamÄ±nda devreye girer; `file://` ile aÃ§Ä±ldÄ±ÄŸÄ±nda uygulama yine Ã§alÄ±ÅŸÄ±r.

## Bu ilk surumde var

- SÃ¼rÃ¼kle-bÄ±rak satÄ±ÅŸ pipeline
- Yeni fÄ±rsat oluÅŸturma, fÄ±rsat seÃ§me ve kopyalama
- Odoo CRM benzeri hÄ±zlÄ± fÄ±rsat kanbanÄ±
- SAP CRM/Sales Cloud benzeri forecast, olasÄ±lÄ±k, kapanÄ±ÅŸ ve sorumlu tablosu
- MeetingBooster benzeri toplantÄ± ajandasÄ±, tutanak ve aksiyon maddeleri
- Google Calendar, Outlook Calendar ve iOS uyumlu takvim modÃ¼lÃ¼
- Gmail/Outlook baÄŸlantÄ± durumunu simÃ¼le eden entegrasyon ekranÄ±
- Ã–rnek gelen e-postayÄ± fÄ±rsata dÃ¶nÃ¼ÅŸtÃ¼rme
- Webhook, ERP, Google Sheets veya Ã¶zel API hedefi iÃ§in veri gÃ¶nder-al taslaÄŸÄ±
- JSON iÃ§e/dÄ±ÅŸa aktarma
- ICS takvim Ã§Ä±ktÄ±sÄ±
- IndexedDB tabanlÄ± yerel veri katmanÄ±
- SEO meta etiketleri, favicon, manifest ve iOS Home Screen uyumluluÄŸu
- Ãœcretli Pro plan ve Ã¶deme akÄ±ÅŸÄ± yeri
- Cloud, self-hosted ve desktop satÄ±ÅŸ paketi tasarÄ±mÄ±
- Docker/Nginx self-hosted statik daÄŸÄ±tÄ±m taslaÄŸÄ±

## Gercek urun icin sonraki mimari

- Frontend: Next.js veya React
- Backend: Node.js/NestJS ya da Laravel
- VeritabanÄ±: PostgreSQL
- Kuyruk: Redis + BullMQ
- Kimlik: e-posta/sifre, Google OAuth, Microsoft OAuth
- E-posta: Gmail API ve Microsoft Graph
- Ã–deme: Stripe Billing veya yerel sanal POS/iyzico
- Veri kÃ¶prÃ¼sÃ¼: webhook alÄ±cÄ±larÄ±, outbound webhook, REST API anahtarlarÄ±
- GÃ¼venlik: tenant ayrÄ±mÄ±, ÅŸifreli token saklama, audit log, rol bazlÄ± yetki
- DaÄŸÄ±tÄ±m: Cloud SaaS, Docker self-hosted ve Windows desktop paketleri
- Lisans: cloud abonelik, server lisansÄ±, desktop lisansÄ±

## Dagitim paketleri

- Cloud Pro: bizim altyapÄ±mÄ±zda aylÄ±k abonelik
- Self-hosted Server: mÃ¼ÅŸterinin kendi sunucusunda yÄ±llÄ±k lisans
- Desktop Starter: Windows kurulum paketi, tek kullanÄ±cÄ± veya kÃ¼Ã§Ã¼k ofis
- Enterprise: Ã¶zel entegrasyon, kurulum ve destek

Self-hosted paketi Docker ile Ã§alÄ±ÅŸtÄ±rmak iÃ§in:

```powershell
docker compose -f deployment/self-hosted/docker-compose.yml up -d --build
```

Bu komut web, API ve PostgreSQL servislerini birlikte baÅŸlatÄ±r.

ÃœrÃ¼n ve lisans detaylarÄ±:

- `docs/business/product-packages.md`
- `docs/business/license-strategy.md`

## SaaS ve veritabani

CanlÄ± SaaS Ã¼rÃ¼ne geÃ§iÅŸ iÃ§in PostgreSQL taslaÄŸÄ± `db/schema.sql` dosyasÄ±ndadÄ±r. Bu ÅŸema tenant, kullanÄ±cÄ±, hesap, kiÅŸi, fÄ±rsat, toplantÄ±, tutanak, aksiyon, OAuth baÄŸlantÄ±sÄ± ve webhook uÃ§larÄ±nÄ± kapsar.

TarayÄ±cÄ± prototipinde veriler IndexedDB Ã¼zerinde saklanÄ±r. Bu sayede kurulum yapmadan DB davranÄ±ÅŸÄ±nÄ± deneyebilir, daha sonra aynÄ± veri modelini backend API ve PostgreSQL tarafÄ±na taÅŸÄ±yabiliriz.

## Urun yonu

Bu prototipin ana yÃ¶nÃ¼:

- Odoo tarafÄ±ndaki akÄ±cÄ± pipeline ve gÃ¼nlÃ¼k satÄ±ÅŸ aktiviteleri
- SAP tarafÄ±ndaki kurumsal fÄ±rsat yÃ¶netimi, forecast ve hesap disiplini
- MeetingBooster tarafÄ±ndaki toplantÄ± tutanaÄŸÄ±, aksiyon sahipliÄŸi ve takip mantÄ±ÄŸÄ±

Ä°kinci fazda hesap kartÄ±, teklif modÃ¼lÃ¼, Ã¼rÃ¼n/hizmet satÄ±rlarÄ±, rol bazlÄ± yetkilendirme, gerÃ§ek OAuth baÄŸlantÄ±larÄ± ve abonelik Ã¶deme akÄ±ÅŸÄ± eklenmelidir.

## Entegrasyon notlari

Gmail tarafÄ±nda gerÃ§ek baÄŸlantÄ± iÃ§in Google Cloud projesi, OAuth consent screen ve dar kapsamlÄ± Gmail API scope seÃ§imi gerekir.

Outlook tarafÄ±nda gerÃ§ek baÄŸlantÄ± iÃ§in Microsoft Entra uygulama kaydÄ±, Microsoft Graph OAuth izinleri ve posta API uÃ§larÄ± gerekir.

Takvim tarafÄ±nda Google Calendar `events.insert/list`, Microsoft Graph calendar `events` ve iOS iÃ§in ICS/PWA stratejisi kullanÄ±lmalÄ±dÄ±r.

Abonelik tarafÄ±nda en hÄ±zlÄ± canlÄ± yol Stripe Checkout + Billing + webhook ile abonelik durumunu backend'de doÄŸrulamaktÄ±r.

## Kaynaklar

- Gmail API scope dokÃ¼manÄ±: https://developers.google.com/workspace/gmail/api/auth/scopes
- Microsoft Graph Outlook mail dokÃ¼manÄ±: https://learn.microsoft.com/en-us/graph/outlook-mail-concept-overview
- Stripe Subscriptions dokÃ¼manÄ±: https://docs.stripe.com/subscriptions
- Google Calendar Events insert dokÃ¼manÄ±: https://developers.google.com/workspace/calendar/api/v3/reference/events/insert
- Microsoft Graph calendar events dokÃ¼manÄ±: https://learn.microsoft.com/en-us/graph/api/calendar-list-events
- Google favicon dokÃ¼manÄ±: https://developers.google.com/search/docs/appearance/favicon-in-search
- Odoo CRM dokÃ¼manÄ±: https://www.odoo.com/documentation/19.0/applications/sales/crm.html
- SAP Opportunity dokÃ¼manÄ±: https://help.sap.com/docs/sap-cloud-for-customer/solution-guide-for-sap-sales-cloud/opportunities
- MeetingBooster action items dokÃ¼manÄ±: https://www.meetingbooster.com/meeting-action-items

