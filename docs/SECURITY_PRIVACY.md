# Security and privacy

## Security posture

The repository includes meaningful security building blocks, including password hashing, JWT-based authentication, hashed refresh-token handling, schema validation, parameterized database queries in inspected areas, encrypted-message helpers and realtime membership checks. These are positive foundations, not proof that the application is production-secure.

This is an engineering checklist, not a penetration-test report. Confirm every item against current code, deployment configuration and tests before release.

## Sensitive data categories

Treat the following as sensitive:
- authentication credentials, access tokens and refresh tokens;
- private messages and encryption metadata;
- relationship assessments or scores;
- precise or historical location;
- cycle, wellbeing and health-adjacent information;
- partner identity and relationship membership;
- notification tokens and third-party OAuth credentials.

Do not place any of these in analytics, crash reports, screenshots, test fixtures, sample data or logs without a documented need and appropriate protection.

## Priority review items

### 1. Browser token storage
The Web client currently stores its access token in localStorage. Any successful script injection in the app's origin could potentially read that token. This is a risk, not evidence of a current XSS vulnerability.

Actions:
- audit all rendering and input paths for XSS;
- apply a strict Content Security Policy and safe output handling where applicable;
- consider an HttpOnly, Secure, SameSite cookie-based web session if the architecture can support CSRF protection and cross-platform consistency;
- keep native storage in platform secure storage;
- ensure logout and revocation clear all relevant client state.

### 2. Login rate limiting
The inspected API entry point uses an in-memory limiter. In-memory limits do not coordinate across multiple server replicas and reset on restart. Confirm expired-key cleanup and memory behavior under many distinct IPs. Use shared rate limiting for multi-instance production deployments.

### 3. Couple and invitation invariants
Test concurrent invitation acceptance and couple creation. Enforce membership limits, one-active-couple rules (if that is the product rule), invitation single-use and expiry in transactions and database constraints, not only sequential application checks.

### 4. Object-level authorization
Test every API path for insecure direct object references. A valid account must not be able to read or mutate another couple's messages, events, location, wellbeing data or assessments by changing an ID.

### 5. Consent and revocation
For location and wellbeing data, verify:
- consent is explicit, purpose-specific and recorded;
- consent can be withdrawn without contacting support;
- revocation stops future collection and sharing promptly;
- background location stops when its session ends;
- partner membership changes invalidate access;
- stored history follows a documented deletion/retention policy;
- no sensitive content leaks through push notifications or realtime broadcasts.

### 6. Encryption claims
The current message flow uses a passphrase-based encryption helper and stores ciphertext/key-envelope fields. Do not claim audited end-to-end encryption until key derivation, nonce handling, authentication, envelope design, recovery, device changes, replay and metadata leakage have been independently reviewed. Prefer maintained, audited cryptographic libraries over custom protocols.

### 7. Realtime authorization
Validate authentication, membership and event-level permissions on every connection and action. Confirm token expiry/revocation, reconnect behavior, connection limits, message-size limits and trusted-proxy handling for forwarded IP headers.

### 8. OAuth and third-party integrations
For Spotify, validate state and callback origin, use least-privilege scopes, protect tokens, support disconnect/revocation and avoid logging callback parameters. Keep third-party secrets server-side.

### 9. Deployment configuration
Production must use HTTPS/WSS, non-default secrets, strict CORS, secure database networking, secret rotation, least-privilege database credentials and monitored backups. Do not ship development URLs or credentials in mobile/web builds.

## Incident-ready basics

Before public launch:
- define a security contact and incident triage owner;
- know how to revoke sessions and third-party tokens;
- have a process to disable location / wellbeing sharing during an incident;
- preserve minimal audit evidence without logging private message bodies;
- define breach assessment and user-notification procedures for applicable jurisdictions;
- test backup restore and data deletion behavior.

## Release blockers

Do not launch sensitive data features publicly until authorization, consent/revocation, retention, encryption design and deployment configuration have been reviewed and tested. A passing typecheck or dependency audit does not replace these checks.
