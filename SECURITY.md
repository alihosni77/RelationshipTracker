# Security Policy

## Scope

RelationshipTracker handles authentication data, private couple data, messages, optional location data, optional cycle/wellbeing data, and third-party integration tokens.

## Before public release

The following are release blockers unless explicitly reviewed and accepted:

- High or critical dependency vulnerabilities.
- Authentication bypass or cross-couple data access.
- WebSocket authorization failures.
- Location or cycle data accessible without active consent.
- Plaintext secret leakage in logs, source control, CI output, or client bundles.
- Broken Time Capsule server-side unlock enforcement.
- Unreviewed cryptographic changes affecting encrypted messages.

## Reporting a vulnerability

Do not open a public GitHub issue for a suspected security vulnerability. Use a private GitHub security advisory or another private disclosure channel available to repository maintainers.

Include reproduction steps, affected versions, impact, and any proposed mitigation when safe to do so.

## Security boundaries

Encrypted-message cryptography is client-side and must use audited platform/browser cryptography APIs. Relationship scores must never be used as enforcement or coercion mechanisms. Location and cycle data require independent, revocable consent and must remain isolated from relationship scoring.
