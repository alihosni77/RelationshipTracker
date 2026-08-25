# RelationshipTracker implementation roadmap

## Phase 1 — foundation (current)

- [x] Expo / React Native application shell
- [x] Shared dashboard and feature navigation
- [x] Couple data model and invitation flow API
- [x] Normal / encrypted / time-capsule message API contract
- [x] Love Tap API
- [x] Shared events API
- [x] Relationship rating API with rate limiting
- [x] Balanced relationship-score endpoint
- [x] Persistence schema for location, cycle, Spotify, playback and assessments
- [x] CI type checks

## Phase 2 — realtime + secure sync

- [ ] WebSocket / realtime delivery for messages and Love Tap
- [ ] Push notification registration and delivery
- [ ] Audited client-side encryption library for encrypted messages
- [ ] Server-enforced Time Capsule release
- [ ] Couple membership authorization middleware on every sensitive route
- [ ] Consent grant/revoke endpoints

## Phase 3 — shared life

- [ ] Full calendar UI and recurring events
- [ ] Spotify OAuth with PKCE
- [ ] Shared playlist editing
- [ ] Playback synchronization state machine with drift correction
- [ ] Activity recommendation engine

## Phase 4 — sensitive features

- [ ] Explicit location-sharing sessions with expiry and revocation
- [ ] Secure location update endpoint and privacy-preserving retention
- [ ] Cycle tracking encrypted storage and selective partner visibility
- [ ] Support suggestions that never affect relationship scoring

## Phase 5 — quality and release

- [ ] Unit tests for scoring, capsule timing and permissions
- [ ] API integration tests with PostgreSQL
- [ ] Mobile E2E tests
- [ ] Security review and threat model
- [ ] App Store / Google Play build profiles

## Product invariants

- Location and cycle data are opt-in and revocable.
- Cycle/health data never contributes to relationship scoring.
- Relationship scores are advisory, never punitive or coercive.
- Time Capsule access is controlled by server time, not device time.
- Passwords and OAuth tokens are never stored in plaintext.
