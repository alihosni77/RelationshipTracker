# Phase Status — Process Fix + Release-Blocking Work

## Scope
This document tracks the acceptance status for the current Level 1/2 release-blocking phase. No feature work should be treated as release-complete unless it has automated verification or an explicit blocker.

## Group A — Process Fix

- **A1 Branching:** **Done & verified.** A feature branch was created from `main` using the GitHub branch API. Current work is isolated from `main`.
- **A2 CI fully green:** **Blocked.** Recent runs reached GitHub Actions with all jobs present, but the observed runs remained `queued` or, in earlier runs, failed before completing the full matrix. Final green end-to-end verification has not been obtained yet.
- **A3 Main direct-commit audit:** **Done & verified.** The security-hardening work includes direct commits on `main`; the self-review identified auth/session/realtime/configuration as high-risk areas requiring verification before merge.

## Group B — Auth & Session Verification

- **B1 Refresh lifecycle:** **Blocked / not verified.** Refresh infrastructure exists, but a full integration test covering expiry, silent refresh, rotation and two-client concurrency has not yet passed in CI.
- **B2 Refresh-token reuse/theft:** **Blocked / not verified.** Rotation/revocation infrastructure exists; security-event verification still needs a passing automated integration test.
- **B3 Unlink session/data revocation:** **Not started.** End-to-end pre-unlink-token rejection across all sensitive partner-data endpoints still needs implementation and verification.
- **B4 Rate-limit load verification:** **Not started.** Configuration exists, but a load test producing deterministic 429/Retry-After results is still required.

## Group C — Staging

- **C1 Real staging:** **Blocked.** No staging host/database/secrets are available through the current connected environment.
- **C2 Deploy main to staging:** **Blocked** by C1.
- **C3 Run suite against staging:** **Blocked** by C1.
- **C4 Staging CI promotion:** **Not started.**

## Group D — Deletion / Unlink / Block

- **D1 Account deletion:** **Not started.**
- **D2 Cascading deletion:** **Not started.**
- **D3 Partner unlink:** **Not started.**
- **D4 Block/report:** **Not started.**
- **D5 End-to-end tests:** **Not started.**

## Group E — Cycle/Health Privacy

- **E1 Field-level encryption:** **Not verified.** Existing consent scaffolding does not prove ciphertext-only storage for cycle data.
- **E2 Storage isolation:** **Not verified.** Current schema must be reworked/audited against a dedicated restricted table/service boundary.
- **E3 Log/analytics exclusion:** **Not verified.** A repository-wide leakage test is still required.
- **E4 Visibility matrix:** **Not verified.** Dedicated matrix must be written and matched by tests.
- **E5 Data minimization:** **Not verified.** Product/data inventory review remains outstanding.

## Group F — Location Consent

- **F1 Coarse-by-default:** **Not verified.**
- **F2 Time-bounded sharing:** **Not verified.**
- **F3 Immediate revocation:** **Partially implemented, not verified end-to-end.**
- **F4 Platform permission review:** **Blocked / needs current store-guidance review and human sign-off.**

## Group G — Legal / Store Drafts

- **G1 Privacy/ToS:** **Not started.**
- **G2 App Privacy/Data Safety drafts:** **Not started.**
- **G3 Per-feature onboarding consent:** **Partially scaffolded, not verified against the full data inventory.**

## Current release blockers

1. End-to-end CI must finish green on a clean checkout.
2. Auth/session verification must pass before calling the auth layer release-ready.
3. Staging credentials/infrastructure are required for environment-specific verification.
4. Deletion/unlink/block flows are not yet implemented.
5. Cycle and location privacy guarantees are not yet fully proven.
6. Legal/store documentation remains draft work.

## Process note
All new work after this document is being placed on feature branches. Direct commits to `main` are no longer the intended workflow.
