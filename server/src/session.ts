import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { Pool } from 'pg';

const ISSUER = 'relationship-tracker';
const AUDIENCE = 'relationship-client';
const ACCESS_TTL = '15m';
const REFRESH_TTL_DAYS = 30;

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function signAccessToken(userId: string, secret: string) {
  return jwt.sign({ sub: userId }, secret, {
    expiresIn: ACCESS_TTL,
    issuer: ISSUER,
    audience: AUDIENCE,
  });
}

export async function issueSession(pool: Pool, userId: string, secret: string) {
  const refreshToken = crypto.randomBytes(48).toString('base64url');
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
  await pool.query(
    'insert into refresh_sessions(user_id,token_hash,expires_at) values($1,$2,$3)',
    [userId, hashToken(refreshToken), expiresAt],
  );
  return { accessToken: signAccessToken(userId, secret), refreshToken, refreshExpiresAt: expiresAt.toISOString() };
}

export async function rotateSession(pool: Pool, refreshToken: string, secret: string) {
  const client = await pool.connect();
  try {
    await client.query('begin');
    const found = await client.query<{ id: string; user_id: string }>(
      'select id,user_id from refresh_sessions where token_hash=$1 and revoked_at is null and expires_at>now() for update',
      [hashToken(refreshToken)],
    );
    const row = found.rows[0];
    if (!row) throw new Error('invalid_refresh_token');
    await client.query('update refresh_sessions set revoked_at=now() where id=$1', [row.id]);
    const nextToken = crypto.randomBytes(48).toString('base64url');
    const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
    await client.query(
      'insert into refresh_sessions(user_id,token_hash,expires_at) values($1,$2,$3)',
      [row.user_id, hashToken(nextToken), expiresAt],
    );
    await client.query('commit');
    return { userId: row.user_id, accessToken: signAccessToken(row.user_id, secret), refreshToken: nextToken, refreshExpiresAt: expiresAt.toISOString() };
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export async function revokeSession(pool: Pool, refreshToken: string) {
  await pool.query('update refresh_sessions set revoked_at=now() where token_hash=$1 and revoked_at is null', [hashToken(refreshToken)]);
}

export async function revokeAllSessions(pool: Pool, userId: string) {
  await pool.query('update refresh_sessions set revoked_at=now() where user_id=$1 and revoked_at is null', [userId]);
}

export const authTokenPolicy = { issuer: ISSUER, audience: AUDIENCE, accessTtl: ACCESS_TTL, refreshTtlDays: REFRESH_TTL_DAYS };
