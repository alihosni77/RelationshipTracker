import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { createServer } from 'http';
import { randomBytes, createHash } from 'crypto';
import { z } from 'zod';
import { attachRealtime, broadcast } from './realtime.js';
import { attachFeatureRoutes } from './features.js';

const env = z.object({ DATABASE_URL: z.string().url(), JWT_SECRET: z.string().min(32), PORT: z.coerce.number().default(4000) }).parse(process.env);
const pool = new Pool({ connectionString: env.DATABASE_URL, max: 10 });
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
async function coupleFor(userId: string) {
  const result = await pool.query<{ couple_id: string }>('select couple_id from couple_members where user_id=$1 limit 1', [userId]);
  return result.rows[0]?.couple_id ?? null;
}

app.get('/health', async (_req, res) => { await pool.query('select 1'); res.json({ status: 'ok' }); });
app.post('/v1/auth/register', async (req, res, next) => {
  try { const input = validate(z.object({ email: z.string().email().transform(v => v.toLowerCase()), password: z.string().min(12).max(128), displayName: z.string().trim().min(1).max(60) }), req.body); const hash = await bcrypt.hash(input.password, 12); const created = await pool.query<{ id: string; email: string; display_name: string }>('insert into users(email,password_hash,display_name) values($1,$2,$3) returning id,email,display_name', [input.email, hash, input.displayName]); const user = created.rows[0]; await pool.query('insert into auth_identities(user_id,provider,provider_subject) values($1,$2,$3)', [user.id, 'password', user.email]); res.status(201).json({ user: { id: user.id, email: user.email, displayName: user.display_name }, accessToken: tokenFor(user.id) }); } catch (error) { next(error); }
});
app.post('/v1/auth/login', async (req, res, next) => {
  try { const input = validate(z.object({ email: z.string().email().transform(v => v.toLowerCase()), password: z.string().min(1) }), req.body); const found = await pool.query<{ id: string; email: string; display_name: string; password_hash: string | null }>('select id,email,display_name,password_hash from users where email=$1', [input.email]); const user = found.rows[0]; if (!user?.password_hash || !(await bcrypt.compare(input.password, user.password_hash))) return res.status(401).json({ error: 'invalid_credentials' }); res.json({ user: { id: user.id, email: user.email, displayName: user.display_name }, accessToken: tokenFor(user.id) }); } catch (error) { next(error); }
});
app.get('/v1/me', requireAuth, async (req: AuthedRequest, res, next) => { try { const result = await pool.query('select id,email,display_name from users where id=$1', [req.userId]); res.json({ user: result.rows[0] }); } catch (error) { next(error); } });

app.post('/v1/couples', requireAuth, async (req: AuthedRequest, res, next) => {
  try { const existing = await coupleFor(req.userId!); if (existing) return res.status(409).json({ error: 'already_paired', coupleId: existing }); const created = await pool.query<{ id: string }>('insert into couples default values returning id'); await pool.query('insert into couple_members(couple_id,user_id) values($1,$2)', [created.rows[0].id, req.userId]); res.status(201).json({ coupleId: created.rows[0].id }); } catch (error) { next(error); }
});
app.post('/v1/couples/invitations', requireAuth, async (req: AuthedRequest, res, next) => {
  try { const coupleId = await coupleFor(req.userId!); if (!coupleId) return res.status(400).json({ error: 'not_paired' }); const members = await pool.query('select count(*)::int as count from couple_members where couple_id=$1', [coupleId]); if (members.rows[0].count >= 2) return res.status(409).json({ error: 'couple_full' }); const token = randomBytes(24).toString('base64url'); const hash = createHash('sha256').update(token).digest('hex'); await pool.query('insert into invitations(couple_id,created_by,token_hash,expires_at) values($1,$2,$3,now()+interval \'24 hours\')', [coupleId, req.userId, hash]); res.status(201).json({ token, expiresInHours: 24 }); } catch (error) { next(error); }
});
app.post('/v1/couples/invitations/accept', requireAuth, async (req: AuthedRequest, res, next) => {
  try { const { token } = validate(z.object({ token: z.string().min(20).max(128) }), req.body); if (await coupleFor(req.userId!)) return res.status(409).json({ error: 'already_paired' }); const hash = createHash('sha256').update(token).digest('hex'); const found = await pool.query<{ id: string; couple_id: string }>('select id,couple_id from invitations where token_hash=$1 and expires_at>now() and accepted_at is null', [hash]); if (!found.rows[0]) return res.status(404).json({ error: 'invalid_or_expired_invitation' }); const members = await pool.query('select count(*)::int as count from couple_members where couple_id=$1', [found.rows[0].couple_id]); if (members.rows[0].count >= 2) return res.status(409).json({ error: 'couple_full' }); const client=await pool.connect(); try { await client.query('begin'); await client.query('insert into couple_members(couple_id,user_id) values($1,$2)', [found.rows[0].couple_id, req.userId]); await client.query('update invitations set accepted_at=now() where id=$1', [found.rows[0].id]); await client.query('commit'); } catch(e) { await client.query('rollback'); throw e; } finally { client.release(); } res.json({ coupleId: found.rows[0].couple_id }); } catch (error) { next(error); }
});
app.get('/v1/couples/me', requireAuth, async (req: AuthedRequest, res, next) => { try { const coupleId = await coupleFor(req.userId!); if (!coupleId) return res.json({ couple: null }); const members = await pool.query('select u.id,u.display_name from couple_members cm join users u on u.id=cm.user_id where cm.couple_id=$1', [coupleId]); res.json({ couple: { id: coupleId, members: members.rows } }); } catch (error) { next(error); } });

app.get('/v1/messages', requireAuth, async (req: AuthedRequest, res, next) => { try { const coupleId = await coupleFor(req.userId!); if (!coupleId) return res.status(400).json({ error: 'not_paired' }); const result = await pool.query('select id,sender_id,kind,ciphertext,key_envelope,unlock_at,created_at from messages where couple_id=$1 and (kind<>\'time_capsule\' or unlock_at is null or unlock_at<=now()) order by created_at desc limit 100', [coupleId]); res.json({ messages: result.rows }); } catch (error) { next(error); } });
app.post('/v1/messages', requireAuth, async (req: AuthedRequest, res, next) => {
  try { const input = validate(z.object({ kind: z.enum(['normal','encrypted','time_capsule']), ciphertext: z.string().min(1).max(20000), keyEnvelope: z.string().max(10000).optional(), unlockAt: z.string().datetime().optional() }), req.body); const coupleId = await coupleFor(req.userId!); if (!coupleId) return res.status(400).json({ error: 'not_paired' }); if (input.kind === 'time_capsule' && !input.unlockAt) return res.status(400).json({ error: 'unlock_at_required' }); if (input.kind !== 'time_capsule' && input.unlockAt) return res.status(400).json({ error: 'unlock_at_not_allowed' }); if(input.kind==='time_capsule' && new Date(input.unlockAt!).getTime()<=Date.now()) return res.status(400).json({error:'unlock_at_must_be_future'}); const result = await pool.query('insert into messages(couple_id,sender_id,kind,ciphertext,key_envelope,unlock_at) values($1,$2,$3,$4,$5,$6) returning id,sender_id,kind,ciphertext,key_envelope,unlock_at,created_at', [coupleId, req.userId, input.kind, input.ciphertext, input.keyEnvelope ?? null, input.unlockAt ?? null]); const message=result.rows[0]; broadcast(coupleId,{type:'message',coupleId,messageId:message.id,createdAt:message.created_at}); res.status(201).json({ message }); } catch (error) { next(error); }
});

app.post('/v1/love-taps', requireAuth, async (req: AuthedRequest, res, next) => { try { const coupleId = await coupleFor(req.userId!); if (!coupleId) return res.status(400).json({ error: 'not_paired' }); const result = await pool.query('insert into love_taps(couple_id,sender_id) values($1,$2) returning id,created_at', [coupleId, req.userId]); const tap=result.rows[0]; broadcast(coupleId,{type:'love_tap',coupleId,senderId:req.userId!,createdAt:tap.created_at}); res.status(201).json({ tap }); } catch (error) { next(error); } });
app.get('/v1/love-taps/latest', requireAuth, async (req: AuthedRequest, res, next) => { try { const coupleId = await coupleFor(req.userId!); if (!coupleId) return res.status(400).json({ error: 'not_paired' }); const result = await pool.query('select id,sender_id,created_at from love_taps where couple_id=$1 and sender_id<>$2 order by created_at desc limit 1', [coupleId, req.userId]); res.json({ tap: result.rows[0] ?? null }); } catch (error) { next(error); } });

app.get('/v1/events', requireAuth, async (req: AuthedRequest, res, next) => { try { const coupleId = await coupleFor(req.userId!); if (!coupleId) return res.status(400).json({ error: 'not_paired' }); const result = await pool.query('select id,title,starts_at,ends_at,notes,created_by,created_at from shared_events where couple_id=$1 order by starts_at asc limit 200', [coupleId]); res.json({ events: result.rows }); } catch (error) { next(error); } });
app.post('/v1/events', requireAuth, async (req: AuthedRequest, res, next) => { try { const input = validate(z.object({ title:z.string().trim().min(1).max(120), startsAt:z.string().datetime(), endsAt:z.string().datetime().optional(), notes:z.string().max(2000).optional() }), req.body); const coupleId=await coupleFor(req.userId!); if(!coupleId)return res.status(400).json({error:'not_paired'}); const result=await pool.query('insert into shared_events(couple_id,title,starts_at,ends_at,notes,created_by) values($1,$2,$3,$4,$5,$6) returning *',[coupleId,input.title,input.startsAt,input.endsAt??null,input.notes??null,req.userId]); res.status(201).json({event:result.rows[0]}); } catch(error){next(error);} });

app.post('/v1/ratings', requireAuth, async (req: AuthedRequest, res, next) => { try { const input=validate(z.object({score:z.number().int().min(1).max(5),category:z.enum(['communication','care','quality_time','trust','overall']),noteCiphertext:z.string().max(5000).optional()}),req.body); const coupleId=await coupleFor(req.userId!); if(!coupleId)return res.status(400).json({error:'not_paired'}); const recent=await pool.query('select count(*)::int as count from relationship_ratings where couple_id=$1 and rater_id=$2 and created_at>now()-interval \'6 hours\'',[coupleId,req.userId]); if(recent.rows[0].count>=3)return res.status(429).json({error:'rating_rate_limit'}); const result=await pool.query('insert into relationship_ratings(couple_id,rater_id,score,category,note_ciphertext) values($1,$2,$3,$4,$5) returning id,score,category,created_at',[coupleId,req.userId,input.score,input.category,input.noteCiphertext??null]); res.status(201).json({rating:result.rows[0]}); } catch(error){next(error);} });
app.get('/v1/relationship-score', requireAuth, async (req: AuthedRequest, res, next) => { try { const coupleId=await coupleFor(req.userId!); if(!coupleId)return res.status(400).json({error:'not_paired'}); const result=await pool.query<{rater_id:string;avg:number;count:number}>('select rater_id,avg(score)::float as avg,count(*)::int as count from relationship_ratings where couple_id=$1 and created_at>now()-interval \'90 days\' group by rater_id',[coupleId]); const byPerson=new Map(result.rows.map(r=>[r.rater_id,r])); const members=await pool.query<{user_id:string}>('select user_id from couple_members where couple_id=$1',[coupleId]); const enough=members.rows.length===2 && members.rows.every(m=>(byPerson.get(m.user_id)?.count??0)>=3); const values=members.rows.map(m=>byPerson.get(m.user_id)?.avg).filter((v):v is number=>typeof v==='number'); const score=enough&&values.length===2 ? Number(((values[0]+values[1])/2).toFixed(2)) : null; res.json({score,confidence:enough?'balanced':'insufficient_feedback',windowDays:90}); } catch(error){next(error);} });

attachFeatureRoutes(app, pool, requireAuth);
app.get('/v1/auth/:provider/start', (req, res) => { const provider=req.params.provider; if(provider!=='google'&&provider!=='apple')return res.status(404).json({error:'unsupported_provider'}); res.status(501).json({error:'oauth_not_configured',provider}); });
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => { if(error instanceof z.ZodError)return res.status(400).json({error:'validation_error',details:error.flatten()}); if((error as {code?:string}).code==='23505')return res.status(409).json({error:'already_exists'}); console.error(error); res.status(500).json({error:'internal_error'}); });

const server = createServer(app);
attachRealtime(server, pool, env.JWT_SECRET);
server.listen(env.PORT,()=>console.log(`Relationship Tracker API listening on ${env.PORT}`));
