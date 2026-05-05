insert into tenants (id, name, plan, billing_status)
values ('11111111-1111-4111-8111-111111111111', 'ARGEKA Demo', 'pro', 'trialing')
on conflict (id) do nothing;

insert into users (id, tenant_id, email, full_name, password_hash, role)
values
  ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'admin@akis-crm.local', 'Akis Admin', '$2a$10$Rws9CLj7g60yBC3Ba5eSiOfpa2p1DEwWwC8J5paKxwFj5GdsqJrLm', 'owner')
on conflict (tenant_id, email) do nothing;

insert into opportunities (tenant_id, owner_id, title, stage, value, probability, forecast, source, close_date, next_action, note)
values
  ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Nova Teknoloji demo', 'new', 84000, 25, 'Pipeline', 'Gmail', '2026-05-18', 'Demo takvimi gÃ¶nder', 'Demo isteÄŸi ve fiyat bilgisi bekliyor.'),
  ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Atlas Lojistik karar gÃ¶rÃ¼ÅŸmesi', 'contacted', 126000, 45, 'Best case', 'Outlook', '2026-05-24', 'Karar vericiyle toplantÄ±', 'Outlook mesajÄ±ndan otomatik fÄ±rsat aÃ§Ä±ldÄ±.')
on conflict do nothing;

