# RelationshipTracker — Testing & Release Plan

## Goal

Reach a release candidate that is reproducible, testable, secure enough for beta distribution, and backed by deterministic CI evidence.

## Non-negotiable release gates

A release cannot be called release-ready until all required gates are green:

1. Mobile TypeScript + Expo dependency validation.
2. Web production export succeeds and serves a valid application shell.
3. API typecheck, unit tests, integration smoke tests, and production build succeed.
4. Every database migration applies cleanly to an empty PostgreSQL 16 database.
5. Docker Compose local stack boots from scratch and passes health checks.
6. Authentication, couple pairing, messages, time capsules, events, ratings, and score flows have integration coverage.
7. Web E2E covers authentication, dashboard navigation, messaging, events, and logout/session behavior.
8. Realtime covers Love Tap and message event delivery between two authenticated clients.
9. Security checks cover CORS, authentication failures, rate limits, payload limits, secret hygiene, and WebSocket authorization.
10. Native release configuration passes Expo validation and EAS configuration checks.
11. Privacy-sensitive features (location and cycle data) remain consent-gated and isolated from relationship scoring.
12. Production credentials are injected only through CI/EAS secrets; no secret is committed to the repository.

## Execution phases

### Phase 0 — Baseline and inventory
- Verify current branch and CI state.
- Inventory app routes, API routes, migrations, environment variables, and build profiles.
- Identify dead code, placeholders, TODOs, and platform-specific gaps.

Exit criteria: inventory documented and all known blockers tracked.

### Phase 1 — Deterministic project health
- Expo dependency validation / doctor.
- TypeScript checks for mobile and server.
- Web export.
- API production build.
- Database migration replay from empty database.

Exit criteria: all deterministic build checks green.

### Phase 2 — Backend integration tests
Cover:
- register/login/me
- duplicate account handling
- couple creation/invitation/acceptance
- authorization boundaries between couples
- normal/encrypted/time-capsule messages
- server-enforced capsule unlock time
- events
- ratings + anti-abuse limits
- relationship score confidence rules
- location/cycle consent boundaries

Exit criteria: integration suite passes against ephemeral PostgreSQL.

### Phase 3 — Realtime and client behavior
- Two-client WebSocket authorization.
- Love Tap delivery.
- Message event delivery.
- Reconnect behavior.
- Invalid/expired token behavior.

Exit criteria: two-client smoke test passes.

### Phase 4 — Web E2E
Use Playwright against the production web export and local API.

Critical journeys:
- first visit
- register
- login
- dashboard
- couple pairing
- message send
- time capsule creation
- event creation
- relationship score view
- logout and session restoration

Exit criteria: critical journeys pass in Chromium.

### Phase 5 — Security and abuse resistance
- Authentication rate limiting.
- Input validation boundaries.
- CORS allowlist.
- Security headers.
- WebSocket authorization.
- Secret scanning / environment review.
- No sensitive data in logs.
- Consent checks for location and cycle data.
- Production error responses do not expose stack traces.

Exit criteria: no high-severity release blocker remains.

### Phase 6 — Native release rehearsal
- Expo doctor.
- EAS configuration validation.
- iOS production build configuration.
- Android production build configuration.
- App metadata, permissions, icons, splash, privacy strings.
- TestFlight submission workflow dry run where credentials are available.

Exit criteria: cloud build configuration is deterministic and credentials are externalized.

### Phase 7 — Release candidate
- Freeze version.
- Run full CI.
- Run local Docker smoke test.
- Run web E2E.
- Run native build checks.
- Review privacy/security documentation.
- Generate release notes.

## Release verdict states

- READY: all required gates green and external credentials configured.
- BLOCKED: code is ready but a required external dependency/credential is missing.
- FAILED: one or more deterministic quality gates are red.

## Current known external prerequisites

The following cannot be fabricated in source code:

- Apple Developer / App Store Connect credentials.
- EAS project/account credentials.
- Production domain and HTTPS certificate.
- Production database and secret values.
- Spotify production OAuth credentials.
- Push notification production credentials.
- Public legal URLs for privacy policy and terms.
