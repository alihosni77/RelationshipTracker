# RelationshipTracker implementation status

## Mobile

- [x] Expo / React Native cross-platform shell
- [x] Persian-first RTL UI
- [x] Authentication UI with secure token storage
- [x] Couple dashboard
- [x] Normal / encrypted / time-capsule messaging UI
- [x] Client-side PBKDF2 + AES-GCM secret-message encryption
- [x] Server-time Time Capsule release enforcement
- [x] Realtime Love Tap haptics
- [x] Push-token registration
- [x] Shared events with next-event countdown
- [x] Relationship rating UI
- [x] Relationship check-in UI
- [x] Activity/date recommendations and saving
- [x] Consent-based location sharing with expiry and partner location display
- [x] Cycle-aware private support flow
- [x] Spotify connection entry point and shared playback state
- [x] EAS build profiles

## Backend

- [x] Password authentication with bcrypt
- [x] Short-lived JWT access tokens
- [x] Couple creation, invitation, acceptance and membership checks
- [x] Message persistence and realtime broadcast
- [x] Love Tap persistence, realtime broadcast and Expo push delivery
- [x] Shared event persistence
- [x] Relationship rating rate limiting and bilateral score confidence
- [x] Consent grant/revoke
- [x] Expiring location sharing
- [x] Encrypted cycle-entry persistence with explicit partner sharing
- [x] Activity persistence and recommendations
- [x] Playback session synchronization state
- [x] Relationship assessments and encrypted result storage
- [x] Spotify PKCE authorization and encrypted token storage
- [x] Realtime websocket authentication

## Quality / release

- [x] TypeScript CI for mobile and API
- [x] Scoring unit tests
- [x] PostgreSQL migration CI checks
- [x] EAS development / preview / production profiles
- [x] Threat model and production security checklist

## External configuration still required

- Spotify developer application credentials and redirect URI
- Production database and JWT/Spotify encryption secrets
- Expo/EAS project configuration and push credentials
- Production HTTPS domain / reverse proxy
- Store accounts and final App Store / Google Play metadata
- Independent security review before public production launch

## Product invariants

- Location sharing is explicit, time-bounded, and revocable.
- Cycle/wellbeing data is separate from relationship scoring.
- Relationship scores are advisory and require balanced feedback.
- Time Capsules use server-side unlock time.
- Plaintext passwords, message plaintext, and raw provider tokens are not persisted.
