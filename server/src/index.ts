import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { z } from 'zod';

const env = z.object({ DATABASE_URL: z.string().url(), JWT_SECRET: z.string().min(32), PORT: z.coerce.number().default(4000) }).parse(process.env);
const pool = new Pool({ connectionString: env.DATABASE_URL });
const app = express();
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '64kb' }));

type AuthedRequest = Request & { userId?: string };
const tokenFor = (userId: string) => jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: '15m', issuer: 'relationship-tracker', audience: 'mobile' });
function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const raw = req.header('authorization')?.replace(/^Bearer\s+/i, '');
  if (!raw) return res.status(401).json({ error: 'unauthorized' });
  try { req.userId = String(jwt.verify(raw, env.JWT_SECRET, { issuer: 'relationship-tracker', audience: 'mobile' }).sub); next(); } catch { res.status(401).json({ error: 'unauthorized' }); }
}
function validate<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> { return schema.parse(body); }

app.get('/health', async (_req, res) => { await pool.query('select 1'); res.json({ status: 'ok' }); });
app.post('/v1/auth/register', async (req, res, next) => {
  try {
    const input = validate(z.object({ email: z.string().email().transform(v => v.toLowerCase()), password: z.string().min(12).max(128), displayName: z.string().trim().min(1).max(60) }), req.body);
    const hash = await bcrypt.hash(input.password, 12);
    const created = await pool.query<{ id: string; email: string; display_name: string }>('insert into users(email,password_hash,display_name) values($1,$2,$3) returning id,email,display_name', [input.email, hash, input.displayName]);
    const user = created.rows[0];
    await pool.query('insert into auth_identities(user_id,provider,provider_subject) values($1,$2,$3)', [user.id, 'password', user.email]);
    res.status(201).json({ user: { id: user.id, email: user.email, displayName: user.display_name }, accessToken: tokenFor(user.id) });
  } catch (error) { next(error); }
});
app.post('/v1/auth/login', async (req, res, next) => {
  try {
    const input = validate(z.object({ email: z.string().email().transform(v => v.toLowerCase()), password: z.string().min(1) }), req.body);
    const found = await pool.query<{ id: string; email: string; display_name: string; password_hash: string | null }>('select id,email,display_name,password_hash from users where email=$1', [input.email]);
    const user = found.rows[0];
    if (!user?.password_hash || !(await bcrypt.compare(input.password, user.password_hash))) return res.status(401).json({ error: 'invalid_credentials' });
    res.json({ user: { id: user.id, email: user.email, displayName: user.display_name }, accessToken: tokenFor(user.id) });
  } catch (error) { next(error); }
});
app.get('/v1/me', requireAuth, async (req: AuthedRequest, res, next) => {
  try { const result = await pool.query('select id,email,display_name from users where id=$1', [req.userId]); res.json({ user: result.rows[0] }); } catch (error) { next(error); }
});
app.get('/v1/auth/:provider/start', (req, res) => {
  const provider = req.params.provider;
  if (provider !== 'google' && provider !== 'apple') return res.status(404).json({ error: 'unsupported_provider' });
  // Native OAuth exchange must be completed with PKCE on the device and verified by a provider-specific endpoint.
  res.status(501).json({ error: 'oauth_not_configured', provider, message: 'Set provider credentials and implement PKCE callback verification before enabling sign-in.' });
});
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof z.ZodError) return res.status(400).json({ error: 'validation_error', details: error.flatten() });
  if ((error as { code?: string }).code === '23505') return res.status(409).json({ error: 'already_exists' });
  console.error(error); res.status(500).json({ error: 'internal_error' });
});
app.listen(env.PORT, () => console.log(`Relationship Tracker API listening on ${env.PORT}`));
