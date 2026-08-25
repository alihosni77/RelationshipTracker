const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:4000';

function uniqueEmail(label: string) {
  return `smoke-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.test`;
}

async function request<T = any>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json');
  if (token) headers.set('authorization', `Bearer ${token}`);
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  const text = await response.text();
  let body: any = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
  if (!response.ok) {
    throw new Error(`${init.method ?? 'GET'} ${path} -> ${response.status}: ${JSON.stringify(body)}`);
  }
  return body as T;
}

async function expectFailure(path: string, init: RequestInit, expectedStatus: number, token?: string) {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json');
  if (token) headers.set('authorization', `Bearer ${token}`);
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  if (response.status !== expectedStatus) {
    const body = await response.text();
    throw new Error(`Expected ${expectedStatus} for ${path}, got ${response.status}: ${body}`);
  }
}

const suffix = Date.now();
const alice = { email: uniqueEmail('alice'), password: 'Correct-Horse-Battery-Staple-123!', displayName: 'Alice' };
const bob = { email: uniqueEmail('bob'), password: 'Correct-Horse-Battery-Staple-456!', displayName: 'Bob' };

const health = await request<{ status: string }>('/health');
if (health.status !== 'ok') throw new Error('health check failed');

const registeredAlice = await request<{ user: { id: string }, accessToken: string }>('/v1/auth/register', { method: 'POST', body: JSON.stringify(alice) });
const registeredBob = await request<{ user: { id: string }, accessToken: string }>('/v1/auth/register', { method: 'POST', body: JSON.stringify(bob) });
const aliceToken = registeredAlice.accessToken;
const bobToken = registeredBob.accessToken;

const me = await request<{ user: { email: string } }>('/v1/me', {}, aliceToken);
if (me.user.email !== alice.email) throw new Error('me endpoint mismatch');

await expectFailure('/v1/couples/me', {}, 200, bobToken);
const couple = await request<{ coupleId: string }>('/v1/couples', { method: 'POST', body: '{}' }, aliceToken);
const invitation = await request<{ token: string }>('/v1/couples/invitations', { method: 'POST', body: '{}' }, aliceToken);
await request('/v1/couples/invitations/accept', { method: 'POST', body: JSON.stringify({ token: invitation.token }) }, bobToken);

const coupleView = await request<{ couple: { members: Array<{ id: string }> } }>('/v1/couples/me', {}, bobToken);
if (coupleView.couple.members.length !== 2) throw new Error('couple pairing failed');

const normal = await request<{ message: { id: string } }>('/v1/messages', { method: 'POST', body: JSON.stringify({ kind: 'normal', ciphertext: `smoke-${suffix}` }) }, aliceToken);
if (!normal.message.id) throw new Error('normal message failed');

await request('/v1/messages', { method: 'POST', body: JSON.stringify({ kind: 'encrypted', ciphertext: 'ciphertext-only', keyEnvelope: 'envelope' }) }, bobToken);

await expectFailure('/v1/messages', { method: 'POST', body: JSON.stringify({ kind: 'time_capsule', ciphertext: 'too-early', unlockAt: new Date(Date.now() - 60_000).toISOString() }) }, 400, aliceToken);
const capsule = await request('/v1/messages', { method: 'POST', body: JSON.stringify({ kind: 'time_capsule', ciphertext: 'future-capsule', unlockAt: new Date(Date.now() + 60_000).toISOString() }) }, aliceToken);
if (!capsule) throw new Error('time capsule creation failed');

const event = await request('/v1/events', { method: 'POST', body: JSON.stringify({ title: 'Smoke Test Date', startsAt: new Date(Date.now() + 86_400_000).toISOString() }) }, bobToken);
if (!event) throw new Error('event creation failed');

await expectFailure('/v1/location/share', { method: 'POST', body: JSON.stringify({ latitude: 35, longitude: 51, expiresAt: new Date(Date.now() + 3_600_000).toISOString() }) }, 403, aliceToken);
await request('/v1/consents', { method: 'POST', body: JSON.stringify({ scope: 'location', expiresAt: new Date(Date.now() + 3_600_000).toISOString() }) }, aliceToken);
await request('/v1/location/share', { method: 'POST', body: JSON.stringify({ latitude: 35.7, longitude: 51.4, accuracyM: 10, expiresAt: new Date(Date.now() + 3_600_000).toISOString() }) }, aliceToken);
const partnerLocation = await request<{ location: { latitude: number } | null }>('/v1/location/partner', {}, bobToken);
if (!partnerLocation.location || partnerLocation.location.latitude !== 35.7) throw new Error('location sharing failed');
await request('/v1/location/stop', { method: 'POST', body: '{}' }, aliceToken);
const stoppedLocation = await request<{ location: unknown | null }>('/v1/location/partner', {}, bobToken);
if (stoppedLocation.location !== null) throw new Error('location revoke failed');

await request('/v1/ratings', { method: 'POST', body: JSON.stringify({ score: 4, category: 'communication' }) }, aliceToken);
await request('/v1/ratings', { method: 'POST', body: JSON.stringify({ score: 5, category: 'care' }) }, aliceToken);
await request('/v1/ratings', { method: 'POST', body: JSON.stringify({ score: 4, category: 'overall' }) }, aliceToken);
await request('/v1/ratings', { method: 'POST', body: JSON.stringify({ score: 4, category: 'communication' }) }, bobToken);
await request('/v1/ratings', { method: 'POST', body: JSON.stringify({ score: 4, category: 'care' }) }, bobToken);
await request('/v1/ratings', { method: 'POST', body: JSON.stringify({ score: 5, category: 'overall' }) }, bobToken);
const score = await request<{ score: number | null, confidence: string }>('/v1/relationship-score', {}, aliceToken);
if (score.score === null || score.confidence !== 'balanced') throw new Error(`relationship score not balanced: ${JSON.stringify(score)}`);

await request('/v1/consents', { method: 'POST', body: JSON.stringify({ scope: 'cycle' }) }, aliceToken);
await request('/v1/cycle/entry', { method: 'POST', body: JSON.stringify({ dataCiphertext: 'encrypted-cycle-data', sharedWithPartner: true }) }, aliceToken);
const partnerCycle = await request<{ entry: unknown | null }>('/v1/cycle/partner', {}, bobToken);
if (!partnerCycle.entry) throw new Error('shared cycle entry unavailable');

console.log('API smoke suite passed');
