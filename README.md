# ARGEKA CRM

Kurulumsuz çalışan ilk web CRM prototipi. Dosyayı tarayıcıda açarak pipeline, sürükle-bırak fırsat yönetimi, e-posta taslak akışı, veri gönder-al formu ve abonelik taslağını deneyebilirsiniz.

## Tek komut Windows kurulumu

Sifir bir Windows bilgisayarda PowerShell acip su komutu calistirin:

```powershell
powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/EnsarKarayel/akis-crm/main/bootstrap.ps1 | iex"
```

Bu komut Git yoksa kurmayi dener, repo'yu `Desktop\ARGEKA-CRM` klasorune indirir, Docker Desktop'i kontrol eder ve ARGEKA CRM servislerini baslatir.

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

Docker/WSL ilk kurulumdan sonra Windows yeniden baslatma isteyebilir. Yeniden baslatma gerekirse ayni komutu tekrar calistirin.

## Yönetim, yedek ve aktarım

Yönetim ekranında kullanıcılar manuel oluşturulur. Kullanıcıya rol, veri kapsamı ve kapalı kolonlar atanır. Örneğin aynı `İş geliştirme` rolündeki uzman sadece kendi kayıtlarını görürken lider tüm firma kayıtlarını görebilir; lider veya uzman için `Değer`, `Forecast`, `Not` gibi kolonlar ayrı ayrı kapatılabilir.

Veritabanı yedeği almak için:

```powershell
powershell -ExecutionPolicy Bypass -File .\backup.ps1
```

Yedeği geri yüklemek için:

```powershell
powershell -ExecutionPolicy Bypass -File .\restore.ps1 -BackupFile .\backups\argeka-crm-YYYYMMDD-HHMMSS.sql
```

Başka sistemlere aktarım dosyası üretmek için:

```powershell
powershell -ExecutionPolicy Bypass -File .\transfer.ps1 -Format csv
powershell -ExecutionPolicy Bypass -File .\transfer.ps1 -Format sql
```

Admin ekranından JSON, CSV ve SQL dışa aktarım da yapılabilir.

## Yeni CRM modülleri

- Müşteriler ekranında firma ve kişi kartları PostgreSQL API ile tutulur.
- Teklifler ekranında firma/kişi bağlantılı teklif oluşturulur, toplam hesaplanır ve teklif çıktısı indirilebilir.
- Görevler ekranında aksiyonlar API'ye yazılır, tamamlandı durumu veritabanına işlenir.
- Entegrasyon ekranında Gmail ve Outlook için OAuth uygulama ayarları kaydedilir. Gerçek domain alındığında redirect URI bu ekrandaki adresle Google Cloud ve Microsoft Entra tarafına girilir.
- Domain/SSL beklerken local OAuth yetki linki üretilebilir, `/oauth/{provider}/callback` kodu yakalar ve sandbox bağlantı gerçek token olmadan modül testini açar.
- Lisans kontrolü kullanıcı limiti, lisans durumu ve bitiş tarihini denetler; koltuk dolduğunda yeni kullanıcı oluşturma engellenir.

## Calistirma

`index.html` dosyasını tarayıcıda açın. Node, npm veya sunucu gerekmez. PWA service worker sadece gerçek `https` veya `localhost` ortamında devreye girer; `file://` ile açıldığında uygulama yine çalışır.

## Bu ilk surumde var

- Sürükle-bırak satış pipeline
- Yeni fırsat oluşturma, fırsat seçme ve kopyalama
- Odoo CRM benzeri hızlı fırsat kanbanı
- SAP CRM/Sales Cloud benzeri forecast, olasılık, kapanış ve sorumlu tablosu
- MeetingBooster benzeri toplantı ajandası, tutanak ve aksiyon maddeleri
- Google Calendar, Outlook Calendar ve iOS uyumlu takvim modülü
- Gmail/Outlook bağlantı durumunu simüle eden entegrasyon ekranı
- Örnek gelen e-postayı fırsata dönüştürme
- Webhook, ERP, Google Sheets veya özel API hedefi için veri gönder-al taslağı
- JSON içe/dışa aktarma
- ICS takvim çıktısı
- IndexedDB tabanlı yerel veri katmanı
- SEO meta etiketleri, favicon, manifest ve iOS Home Screen uyumluluğu
- Ücretli Pro plan ve ödeme akışı yeri
- Cloud, self-hosted ve desktop satış paketi tasarımı
- Docker/Nginx self-hosted statik dağıtım taslağı

## Gercek urun icin sonraki mimari

- Frontend: Next.js veya React
- Backend: Node.js/NestJS ya da Laravel
- Veritabanı: PostgreSQL
- Kuyruk: Redis + BullMQ
- Kimlik: e-posta/sifre, Google OAuth, Microsoft OAuth
- E-posta: Gmail API ve Microsoft Graph
- Ödeme: Stripe Billing veya yerel sanal POS/iyzico
- Veri köprüsü: webhook alıcıları, outbound webhook, REST API anahtarları
- Güvenlik: tenant ayrımı, şifreli token saklama, audit log, rol bazlı yetki
- Dağıtım: Cloud SaaS, Docker self-hosted ve Windows desktop paketleri
- Lisans: cloud abonelik, server lisansı, desktop lisansı

## Dagitim paketleri

- Cloud Pro: bizim altyapımızda aylık abonelik
- Self-hosted Server: müşterinin kendi sunucusunda yıllık lisans
- Desktop Starter: Windows kurulum paketi, tek kullanıcı veya küçük ofis
- Enterprise: özel entegrasyon, kurulum ve destek

Self-hosted paketi Docker ile çalıştırmak için:

```powershell
docker compose -f deployment/self-hosted/docker-compose.yml up -d --build
```

Bu komut web, API ve PostgreSQL servislerini birlikte başlatır.

Ürün ve lisans detayları:

- `docs/business/product-packages.md`
- `docs/business/license-strategy.md`

## SaaS ve veritabani

Canlı SaaS ürüne geçiş için PostgreSQL taslağı `db/schema.sql` dosyasındadır. Bu şema tenant, kullanıcı, hesap, kişi, fırsat, toplantı, tutanak, aksiyon, OAuth bağlantısı ve webhook uçlarını kapsar.

Tarayıcı prototipinde veriler IndexedDB üzerinde saklanır. Bu sayede kurulum yapmadan DB davranışını deneyebilir, daha sonra aynı veri modelini backend API ve PostgreSQL tarafına taşıyabiliriz.

## Urun yonu

Bu prototipin ana yönü:

- Odoo tarafındaki akıcı pipeline ve günlük satış aktiviteleri
- SAP tarafındaki kurumsal fırsat yönetimi, forecast ve hesap disiplini
- MeetingBooster tarafındaki toplantı tutanağı, aksiyon sahipliği ve takip mantığı

Sonraki fazda ürün/hizmet satırları, teklif PDF şablonu, gerçek OAuth callback akışı, domain/SSL yayını ve abonelik ödeme akışı eklenmelidir.

## Entegrasyon notlari

Gmail tarafında gerçek bağlantı için Google Cloud projesi, OAuth consent screen ve dar kapsamlı Gmail API scope seçimi gerekir.

Outlook tarafında gerçek bağlantı için Microsoft Entra uygulama kaydı, Microsoft Graph OAuth izinleri ve posta API uçları gerekir.

Takvim tarafında Google Calendar `events.insert/list`, Microsoft Graph calendar `events` ve iOS için ICS/PWA stratejisi kullanılmalıdır.

Abonelik tarafında en hızlı canlı yol Stripe Checkout + Billing + webhook ile abonelik durumunu backend'de doğrulamaktır.

## Kaynaklar

- Gmail API scope dokümanı: https://developers.google.com/workspace/gmail/api/auth/scopes
- Microsoft Graph Outlook mail dokümanı: https://learn.microsoft.com/en-us/graph/outlook-mail-concept-overview
- Stripe Subscriptions dokümanı: https://docs.stripe.com/subscriptions
- Google Calendar Events insert dokümanı: https://developers.google.com/workspace/calendar/api/v3/reference/events/insert
- Microsoft Graph calendar events dokümanı: https://learn.microsoft.com/en-us/graph/api/calendar-list-events
- Google favicon dokümanı: https://developers.google.com/search/docs/appearance/favicon-in-search
- Odoo CRM dokümanı: https://www.odoo.com/documentation/19.0/applications/sales/crm.html
- SAP Opportunity dokümanı: https://help.sap.com/docs/sap-cloud-for-customer/solution-guide-for-sap-sales-cloud/opportunities
- MeetingBooster action items dokümanı: https://www.meetingbooster.com/meeting-action-items

