/** Contracts deliberately contain no secrets or encryption implementation.
 * Implement these server-side with authenticated RLS and audited crypto primitives. */
export type ConsentScope = 'location' | 'cycle_reminders' | 'spotify' | 'notifications';
export interface Consent { scope: ConsentScope; grantedAt: string; expiresAt?: string; revokedAt?: string; }
export interface TimeCapsuleRequest { ciphertext: string; keyEnvelope: string; unlockAt: string; }
export interface LocationShareRequest { latitude: number; longitude: number; expiresAt: string; accuracyMeters: number; }
export interface MusicRoomState { playlistId: string; trackUri?: string; positionMs: number; isPlaying: boolean; updatedAt: string; }
export const canShare = (consent: Consent | undefined, now = Date.now()) => Boolean(consent && !consent.revokedAt && (!consent.expiresAt || new Date(consent.expiresAt).getTime() > now));
