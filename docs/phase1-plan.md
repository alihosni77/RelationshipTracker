# Phase 1 Implementation Plan

1. Audit current auth, transport, CORS, secrets, realtime and dependency configuration.
2. Add production startup guards for secrets and transport.
3. Harden authentication/session lifecycle and rate limiting.
4. Add structured audit events without sensitive payloads.
5. Harden WebSocket authentication and rate limits.
6. Add tests for each security invariant.
7. Run clean CI and update `docs/security/review.md` with evidence.

Exit criteria: Phase 1 acceptance criteria all tested or explicitly recorded as blocked by external credentials/infrastructure.
