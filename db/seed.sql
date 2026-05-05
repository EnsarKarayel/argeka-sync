insert into tenants (id, name, plan, billing_status)
values ('11111111-1111-4111-8111-111111111111', 'Akis Demo', 'pro', 'trialing')
on conflict (id) do nothing;

insert into users (id, tenant_id, email, full_name, role)
values
  ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'admin@akis-crm.local', 'Akis Admin', 'owner')
on conflict (tenant_id, email) do nothing;

insert into opportunities (tenant_id, owner_id, title, stage, value, probability, forecast, source, close_date, next_action, note)
values
  ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Nova Teknoloji demo', 'new', 84000, 25, 'Pipeline', 'Gmail', '2026-05-18', 'Demo takvimi gönder', 'Demo isteği ve fiyat bilgisi bekliyor.'),
  ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Atlas Lojistik karar görüşmesi', 'contacted', 126000, 45, 'Best case', 'Outlook', '2026-05-24', 'Karar vericiyle toplantı', 'Outlook mesajından otomatik fırsat açıldı.')
on conflict do nothing;
