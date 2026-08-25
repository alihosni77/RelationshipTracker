-- Relationship feature persistence. All sensitive records are scoped to a couple.
create table if not exists love_taps (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  sender_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists love_taps_couple_created_idx on love_taps(couple_id, created_at desc);

create table if not exists relationship_ratings (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  rater_id uuid not null references users(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  category text not null check (category in ('communication','care','quality_time','trust','overall')),
  note_ciphertext text,
  created_at timestamptz not null default now()
);
create index if not exists ratings_couple_created_idx on relationship_ratings(couple_id, created_at desc);

create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  version text not null,
  answers_ciphertext text not null,
  completed_by uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists shared_activities (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  title text not null,
  description text,
  tags text[] not null default '{}',
  saved_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists location_shares (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  accuracy_m double precision,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists location_shares_active_idx on location_shares(couple_id, user_id, expires_at desc);

create table if not exists cycle_entries (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  data_ciphertext text not null,
  shared_with_partner boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists spotify_connections (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  access_token_ciphertext text not null,
  refresh_token_ciphertext text not null,
  expires_at timestamptz not null,
  spotify_user_id text not null,
  unique(couple_id, user_id)
);

create table if not exists playback_sessions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  track_uri text not null,
  position_ms integer not null default 0,
  is_playing boolean not null default false,
  revision bigint not null default 0,
  updated_by uuid not null references users(id),
  updated_at timestamptz not null default now()
);
