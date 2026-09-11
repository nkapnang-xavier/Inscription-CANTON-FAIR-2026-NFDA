create table if not exists inscriptions_canton_2026 (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  nom           text not null,
  whatsapp      text not null,
  ville_pays    text not null,
  activite      text not null,
  recherche     jsonb not null default '[]'::jsonb,
  recherche_autre text,
  paiement      text not null,
  paiement_autre  text,
  decision      text not null
);

create index if not exists inscriptions_canton_2026_created_at_idx
  on inscriptions_canton_2026 (created_at desc);
