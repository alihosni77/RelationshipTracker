# Authentication & Session Verification

Status: **Not release-ready**

## Existing controls observed

- bcrypt password hashing is present.
- Passwords require at least 12 characters.
- JWT issuer/audience validation is present.
- Access tokens have been shortened from the original long-lived form.
- Refresh-session persistence and rotation infrastructure exists.
- Login throttling/backoff infrastructure exists.
- Security audit logging infrastructure exists.

## Required automated verification before release

1. Login issues access + refresh credentials.
2. Expired access token can be silently refreshed.
3. Refresh rotates the token and invalidates the old refresh token.
4. Reuse of a stale refresh token revokes the token family and emits a security audit event.
5. Two independent sessions for the same user remain valid when only one session rotates.
6. Logout invalidates the current refresh session.
7. Pairing unlink invalidates sessions that depend on the shared relationship where policy requires it.
8. A pre-unlink token cannot retrieve partner-sensitive data after unlink.
9. Authentication and invitation endpoints return HTTP 429 under sustained abuse and expose a retry interval.
10. Production configuration rejects placeholder secrets and insecure HTTP origins.

## Verification status

The controls above cannot yet be called verified end-to-end because the current CI run has not completed a full green matrix and a real staging deployment is not available in this environment.
