-- Admin settings key-value
create table if not exists admin_settings(
  key text primary key,
  value text not null
);
insert into admin_settings(key,value) values
  ('GEN_PER_SEC','0.2') on conflict (key) do nothing,
  ('DAILY_CAP','50') on conflict (key) do nothing,
  ('ATTACK_COST_BASE','3') on conflict (key) do nothing,
  ('ATTACK_COST_STEP','1') on conflict (key) do nothing;

-- Core player state (season-less demo)
create table if not exists states(
  user_id text primary key,
  base_purchased boolean not null default false,
  base_started_at timestamptz,
  last_collected_at timestamptz,
  generated_today numeric not null default 0,
  obrix_total integer not null default 0
);
