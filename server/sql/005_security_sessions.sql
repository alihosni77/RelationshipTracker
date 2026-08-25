create table refresh_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);
create index refresh_sessions_user_idx on refresh_sessions(user_id);
create index refresh_sessions_active_idx on refresh_sessions(token_hash, expires_at) where revoked_at is null;

create table auth_login_state (
  lookup_key text primary key,
  failures integer not null default 0,
  first_failure_at timestamptz,
  locked_until timestamptz
);

create table security_audit_log (
  id bigserial primary key,
  actor_user_id uuid references users(id) on delete set null,
  couple_id uuid references couples(id) on delete set null,
  event_type text not null,
  success boolean not null default true,
  ip_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index security_audit_log_created_idx on security_audit_log(created_at desc);
create index security_audit_log_actor_idx on security_audit_log(actor_user_id, created_at desc);
