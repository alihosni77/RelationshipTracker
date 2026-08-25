# Security Review — Phase 1 Baseline

Status: IN PROGRESS

## Scope

Authentication, transport, secrets, CORS, route validation, audit logging, dependency security, and realtime/WebSocket controls.

## Findings to verify and remediate

- Production startup must reject placeholder secrets and insecure URLs.
- Production transport must require HTTPS/WSS.
- Authentication must use strong password hashing, short-lived access tokens, rotating refresh tokens, logout/session revocation, brute-force backoff, and pairing endpoint rate limits.
- CORS must be an explicit production allow-list.
- Every request body, query, and path parameter must be validated before use.
- Security audit events must never contain message plaintext, coordinates, health/cycle data, or authentication secrets.
- Dependency scanning must fail on high/critical vulnerabilities.
- WebSocket authentication must use a short-lived access token, validate couple membership, and enforce connection/message rate limits and replay resistance.

## Current verified baseline

- PostgreSQL access is parameterized with `pg` queries.
- WebSocket JWT authentication validates issuer/audience and couple membership.
- Production CORS is intended to be allow-list based.
- CI includes typecheck, unit tests, migration checks, Docker checks, web export, and high-severity npm audit gates.

## Release blockers

This document remains incomplete until every Phase 1 acceptance criterion is implemented and covered by tests.
