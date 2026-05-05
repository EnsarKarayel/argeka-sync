insert into tenants (id, name, plan, billing_status)
values ('11111111-1111-4111-8111-111111111111', 'ARGEKA Demo', 'pro', 'trialing')
on conflict (id) do nothing;

insert into app_roles (id, tenant_id, key, name, data_scope, hidden_columns, permissions)
values
  ('33333333-3333-4333-8333-333333333331', '11111111-1111-4111-8111-111111111111', 'owner', 'Sistem sahibi', 'all', '{}', '{"admin":true,"users":true,"license":true,"backup":true,"export":true}'),
  ('33333333-3333-4333-8333-333333333332', '11111111-1111-4111-8111-111111111111', 'business_development', 'İş geliştirme', 'own', '{"forecast","probability"}', '{"opportunities":true,"meetings":true}'),
  ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111', 'sales_operations', 'Satış operasyon', 'team', '{"note"}', '{"opportunities":true,"meetings":true,"export":true}'),
  ('33333333-3333-4333-8333-333333333334', '11111111-1111-4111-8111-111111111111', 'finance', 'Finans', 'all', '{"nextAction","note"}', '{"opportunities":true,"billing":true,"export":true}')
on conflict (tenant_id, key) do nothing;

insert into users (id, tenant_id, email, full_name, password_hash, role, role_id, data_scope, hidden_columns)
values
  ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'admin@akis-crm.local', 'ARGEKA Admin', '$2a$10$Rws9CLj7g60yBC3Ba5eSiOfpa2p1DEwWwC8J5paKxwFj5GdsqJrLm', 'owner', '33333333-3333-4333-8333-333333333331', 'all', '{}')
on conflict (tenant_id, email) do nothing;

insert into license_settings (tenant_id, customer_name, edition, status, seats)
values ('11111111-1111-4111-8111-111111111111', 'ARGEKA Demo', 'self-hosted', 'trialing', 5)
on conflict (tenant_id) do nothing;

insert into opportunities (tenant_id, owner_id, title, stage, value, probability, forecast, source, close_date, next_action, note)
values
  ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Nova Teknoloji demo', 'new', 84000, 25, 'Pipeline', 'Gmail', '2026-05-18', 'Demo takvimi gönder', 'Demo isteği ve fiyat bilgisi bekliyor.'),
  ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Atlas Lojistik karar görüşmesi', 'contacted', 126000, 45, 'Best case', 'Outlook', '2026-05-24', 'Karar vericiyle toplantı', 'Outlook mesajından otomatik fırsat açıldı.')
on conflict do nothing;

