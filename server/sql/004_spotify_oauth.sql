create table if not exists spotify_oauth_states (
  state text primary key,
  user_id uuid not null references users(id) on delete cascade,
  code_verifier text not null,
  expires_at timestamptz not null
);
create index if not exists spotify_oauth_states_expiry_idx on spotify_oauth_states(expires_at);
