import crypto from 'node:crypto';
import type { Pool } from 'pg';

const PLACEHOLDER_SECRET_PATTERNS = [
  'change-me',
  'generate-a-long-random-secret',
  'relationship_dev_only',
  'local-development',
  'your-api.example.com',
  'example.com',
];

export function assertProductionSecurity(env: {
  NODE_ENV: string;
  JWT_SECRET: string;
  DATABASE_URL: string;
  CORS_ORIGINS: string;
  PUBLIC_WEB_ORIGIN?: string;
}) {
  if (env.NODE_ENV !== 'production') return;
  const values = [env.JWT_SECRET, env.DATABASE_URL, env.CORS_ORIGINS, env.PUBLIC_WEB_ORIGIN ?? ''];
  const joined = values.join('|').toLowerCase();
  if (PLACEHOLDER_SECRET_PATTERNS.some(pattern => joined.includes(pattern))) {
    throw new Error('production_configuration_contains_placeholder_values');
  }
  if (env.JWT_SECRET.length < 48) throw new Error('production_jwt_secret_too_short');
  if (env.CORS_ORIGINS.includes('*')) throw new Error('production_cors_wildcard_forbidden');
  if (!env.PUBLIC_WEB_ORIGIN?.startsWith('https://')) throw new Error('production_public_web_origin_must_use_https');
  if (env.PUBLIC_WEB_ORIGIN.includes('localhost') || env.PUBLIC_WEB_ORIGIN.includes('127.0.0.1')) {
    throw new Error('production_public_web_origin_must_not_be_localhost');
  }
}

export function assertSecureRequest(req: { secure: boolean; get(name: string): string | undefined; path: string }, nodeEnv: string) {
  if (nodeEnv !== 'production') return true;
  const forwardedProto = req.get('x-forwarded-proto');
  const isSecure = req.secure || forwardedProto === 'https';
  if (!isSecure && req.path !== '/health' && req.path !== '/ready') throw new Error('secure_transport_required');
  return true;
}

export function hashIp(ip: string | undefined, salt: string) {
  return crypto.createHash('sha256').update(`${salt}:${ip ?? 'unknown'}`).digest('hex');
}

export async function auditSecurityEvent(
  pool: Pool,
  input: { actorUserId?: string; coupleId?: string; eventType: string; success?: boolean; ip?: string; metadata?: Record<string, string | number | boolean | null> },
  auditSalt: string,
) {
  const safeMetadata = { ...input.metadata };
  for (const key of Object.keys(safeMetadata)) {
    if (/message|cipher|location|latitude|longitude|cycle|health|password|token|secret/i.test(key)) delete safeMetadata[key];
  }
  await pool.query(
    'insert into security_audit_log(actor_user_id,couple_id,event_type,success,ip_hash,metadata) values($1,$2,$3,$4,$5,$6::jsonb)',
    [input.actorUserId ?? null, input.coupleId ?? null, input.eventType, input.success ?? true, hashIp(input.ip, auditSalt), JSON.stringify(safeMetadata)],
  );
}

export async function canAttemptLogin(pool: Pool, lookupKey: string) {
  const row = await pool.query<{ failures: number; locked_until: Date | null }>(
    'select failures,locked_until from auth_login_state where lookup_key=$1',
    [lookupKey],
  );
  if (!row.rows[0]) return { allowed: true, remaining: 5 };
  const lockedUntil = row.rows[0].locked_until?.getTime() ?? 0;
  if (lockedUntil > Date.now()) return { allowed: false, retryAfterSeconds: Math.ceil((lockedUntil - Date.now()) / 1000) };
  return { allowed: true, remaining: Math.max(0, 5 - row.rows[0].failures) };
}

export async function recordLoginFailure(pool: Pool, lookupKey: string) {
  await pool.query(`
    insert into auth_login_state(lookup_key,failures,first_failure_at,locked_until)
    values($1,1,now(),null)
    on conflict (lookup_key) do update set
      failures = auth_login_state.failures + 1,
      locked_until = case
        when auth_login_state.failures + 1 >= 5 then now() + interval '15 minutes'
        else auth_login_state.locked_until
      end
  `, [lookupKey]);
}

export async function clearLoginFailures(pool: Pool, lookupKey: string) {
  await pool.query('delete from auth_login_state where lookup_key=$1', [lookupKey]);
}
