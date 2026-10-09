# Testing and release

## Test layers

### Static checks
- TypeScript typecheck.
- Lint.
- Expo diagnostics.
- Dependency audit and lockfile review.

### Client tests
- Playwright Web tests for the main browser flows.
- UI states: loading, empty, error, disabled, success and offline.
- RTL and responsive checks at narrow mobile, tablet and desktop widths.
- Keyboard and screen-reader checks for forms and primary actions.

### API tests
- Authentication and session expiry.
- Validation failures and malformed input.
- Object-level authorization across two separate couples.
- Rate limits and abuse cases.
- Invitation expiry, single-use and concurrent acceptance.
- Message kind validation, encryption metadata and time-capsule unlock semantics.
- Consent creation, revocation and data access after revocation.
- Realtime membership and event authorization.

### Integration tests
- API + PostgreSQL from a clean database.
- Migration forward path and backup/restore path.
- Web client + local API.
- Push and realtime behavior under disconnect/reconnect.
- OAuth callback and disconnect flow using test credentials.

## Repository commands

The scripts declared in package.json include:
- npm run typecheck
- npm run lint
- npm run web:export
- npm run web:test
- npm run doctor
- bash scripts/local-mac.sh smoke

Run the relevant scripts after each change. Check CI workflow definitions for the authoritative CI command sequence.

## CI expectations

A green build should mean:
1. dependencies install from the lockfile;
2. typecheck and lint pass;
3. API unit/integration tests pass;
4. Web end-to-end tests pass;
5. Web export succeeds;
6. the produced artifact is verified;
7. dependency/security checks complete.

An old green run is not evidence that the current branch passes. When a job fails, preserve the exact log, identify the failing assertion or setup step, fix the cause and rerun the affected job.

## Visual QA checklist

- [ ] Welcome, auth and home use the same token system.
- [ ] Home renders with no event and with a future event.
- [ ] Home renders with no couple and with a paired account.
- [ ] Timer remains legible and stable on a narrow phone.
- [ ] Cards do not overflow at 320–375 px widths.
- [ ] Wide Web view uses a readable maximum content width.
- [ ] Persian text has correct direction and line wrapping.
- [ ] Focus/pressed/loading/disabled states are visible.
- [ ] No new route or API behavior was introduced by a visual-only change.
- [ ] Screenshots are reviewed at real device or browser sizes, not only in code.

## Production release checklist

### Product
- [ ] Feature status and limitations are accurate.
- [ ] Privacy copy matches real server behavior.
- [ ] Support, account deletion and data export expectations are documented.

### Security
- [ ] Production secrets and URLs are configured.
- [ ] HTTPS/WSS and strict CORS are active.
- [ ] Authentication, authorization, consent and revocation tests pass.
- [ ] Sensitive logs and notification payloads are reviewed.
- [ ] Session revocation and third-party disconnect work.

### Operations
- [ ] Database migrations have been reviewed and tested.
- [ ] Backup restore is tested.
- [ ] Health checks and error monitoring are active.
- [ ] Rollback / disable plan exists.
- [ ] iOS/Android permissions match the features actually enabled.
- [ ] App Store privacy declarations match data collection and sharing.

### Sign-off
Record the commit SHA, CI run, device/browser matrix, known issues and explicit approval before publishing. Do not infer release readiness from successful compilation alone.
