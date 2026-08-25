# Phase 1 Security Execution Baseline

This file tracks the implementation gate for the first release-blocking phase. It is intentionally separate from the final review so unresolved findings remain visible during development.

## Exit criteria

- production secrets are validated at startup
- production transport is HTTPS/WSS only
- auth/session lifecycle is revocable and rate limited
- CORS is explicit
- all API inputs are validated
- security audit events omit sensitive payloads
- dependency scan blocks high/critical issues
- realtime auth has membership, replay, and rate controls
- automated tests cover each invariant

Status: in progress
