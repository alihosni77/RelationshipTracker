# Product plan

## MVP delivered in the client

1. Pair onboarding and authenticated session.
2. Shared dashboard: Love Tap, countdown and module navigation.
3. Messages: normal, secret and time-capsule composer.
4. Shared music, calendar/events, check-ins, fair ratings, activity ideas, consented location and cycle-aware support flows.

## Production sequence

1. **Foundation** — Supabase Auth, couples table, row-level security, device push token registration, audit log and account deletion.
2. **Messaging** — per-device public keys; encrypt on device with a vetted library; store ciphertext only; enforce time-capsule unlock server-side; send push without message content.
3. **Realtime modules** — events, Love Tap and music-room state through Realtime channels; Spotify OAuth tokens encrypted server-side and refreshed via an Edge Function.
4. **Sensitive sharing** — location has an explicit expiry and a visible stop control; cycle data is private by default, minimal, separately consented, and never enters relationship scoring.
5. **Quality and release** — unit tests for scoring/consent/time, E2E tests for pairing/revocation, accessibility, localization, security review, TestFlight/internal Android rollout.

## Non-negotiable safeguards

- Each partner can revoke sharing immediately without needing the other partner’s approval.
- No coercive notifications, hidden tracking, or relationship score used for control.
- Rating algorithm requires sufficient recent input from both people; it shows a conversation prompt, not a verdict.
- Do not claim end-to-end encryption until device-key management and independent review are complete.
