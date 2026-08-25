# ADR 000 — Phase 1 Security Hardening

## Context

RelationshipTracker handles authentication, private couple data, location, cycle/health data, messaging, and realtime events. Security controls therefore need to be enforced server-side and treated as release blockers.

## Decisions

1. Secrets are environment-injected and production startup rejects placeholders.
2. Production transport is HTTPS/WSS only.
3. Access tokens are short-lived; refresh sessions are rotated and revocable.
4. Sensitive permissions are represented as explicit consent records with audit events.
5. Realtime authentication uses a short-lived access token and verifies couple membership before joining a channel.
6. Security audit logs never include message text, location coordinates, cycle data, passwords, access tokens, or refresh tokens.
7. CI fails on high/critical dependency vulnerabilities.

## Consequences

Development continues to support localhost HTTP, while production configurations cannot silently downgrade transport security. Sensitive feature work must build on these invariants.
