import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'node:crypto';
import type { Pool } from 'pg';

const ACCESS_ISSUER = 'relationship-tracker';
const ACCESS_AUDIENCE = 'relationship-client';
const ACCESS_TTL = '15m';
const REFRESH_DAYS = 30;

export function signAccessToken(userId: string, secret: string) {
  return jwt.sign({ sub: userId }, secret, {
    expiresIn: ACCESS_TTL,
    issuer: ACCESS_ISSUER,
    audience: ACCESS_AUDIENCE,
  });
}

function hashRefreshToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function issueSession(pool: Pool, userId: string, secret: string) {
  const refreshToken = randomBytes(48).toString('base64url');
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
  await pool.query(
    'insert into refresh_tokens(user_id,token_hash,expires_at) values($1,$2,$3)',
    [userId, hashRefreshToken(refreshToken), expiresAt],
  );
  return {
    accessToken: signAccessToken(userId, secret),
    refreshToken,
    refreshExpiresAt: expiresAt.toISOString(),
  };
}

export async function rotateSession(pool: Pool, refreshToken: string, secret: string) {
  const hash = hashRefreshToken(refreshToken);
  const client = await pool.connect();
  try {
    await client.query('begin');
    const found = await client.query<{ id: string; user_id: string }>(
      'select id,user_id from refresh_tokens where token_hash=$1 and revoked_at is null and expires_at>now() for update',
      [hash],
    );
    const row = found.rows[0];
    if (!row) throw new Error('invalid_refresh_token');

    await client.query('update refresh_tokens set revoked_at=now() where id=$1', [row.id]);
    const nextRefreshToken = randomBytes(48).toString('base64url');
    const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
    await client.query(
      'insert into refresh_tokens(user_id,token_hash,expires_at) values($1,$2,$3)',
      [row.user_id, hashRefreshToken(nextRefreshToken), expiresAt],
    );
    await client.query('commit');

    return {
      userId: row.user_id,
      accessToken: signAccessToken(row.user_id, secret),
      refreshToken: nextRefreshToken,
      refreshExpiresAt: expiresAt.toISOString(),
    };
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export async function revokeSession(pool: Pool, refreshToken: string) {
  await pool.query('update refresh_tokens set revoked_at=now() where token_hash=$1 and revoked_at is null', [hashRefreshToken(refreshToken)]);
}

export const authConstants = { ACCESS_ISSUER, ACCESS_AUDIENCE };
