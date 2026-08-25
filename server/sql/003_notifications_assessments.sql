create table if not exists push_devices (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  expo_push_token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, expo_push_token)
);

create table if not exists assessment_results (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  completed_by uuid not null references users(id) on delete cascade,
  version text not null,
  answers_ciphertext text not null,
  created_at timestamptz not null default now()
);
