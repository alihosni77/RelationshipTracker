# RelationshipTracker threat model

## Assets

- Account credentials and access tokens
- Private relationship messages
- Encrypted message key envelopes
- Location data
- Cycle/wellbeing data
- Shared events and relationship ratings
- Spotify connection tokens

## Primary threats

1. Account takeover: mitigated by hashed passwords, short-lived JWTs, secure mobile token storage, and future provider OAuth.
2. Cross-couple data access: every sensitive API operation derives the caller's couple from membership instead of trusting a client-supplied couple id.
3. Realtime impersonation: WebSocket connections authenticate with a signed mobile token and require couple membership.
4. Premature Time Capsule release: list queries only return capsules after server-side `now()` reaches `unlock_at`.
5. Location over-sharing: explicit consent, expiry, and immediate revocation are enforced.
6. Cycle-data misuse: cycle data is stored separately, requires consent, and is excluded from relationship scoring.
7. Rating manipulation: per-user rate limiting, bilateral minimum sample size, and disagreement penalty reduce score gaming.
8. Secret-message disclosure: plaintext is encrypted on the client with PBKDF2 + AES-GCM before upload; the server stores ciphertext and a key envelope.

## Operational requirements before public release

- Rotate all production secrets outside source control.
- Put the API behind TLS and a reverse proxy with request limits.
- Add device/session revocation and refresh-token rotation.
- Add structured audit logs without logging message plaintext, passwords, tokens, or precise location history.
- Perform an independent mobile and backend security assessment.
- Configure Spotify credentials, redirect URIs, and provider policy-compliant OAuth flows.
