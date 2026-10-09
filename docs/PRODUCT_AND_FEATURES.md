# Product and feature map

## Product intent

Hamqadam is a private shared space for two people. The product should make small acts of care, meaningful dates, private messages and shared activities feel calm and intentional. Privacy, consent and user control are product requirements—not decorative marketing copy.

## Primary experience

1. A person opens the welcome screen and signs in or creates an account.
2. The authenticated user reaches their shared home.
3. The home surface highlights the next upcoming event, a lightweight Love Tap action and shortcuts into the shared features.
4. The user opens a feature, completes an action, and returns to the shared space.
5. Sensitive capabilities—especially location and wellbeing/cycle information—must be explicit, purpose-limited and revocable.

The exact invitation/pairing flow and its edge cases must be verified against the current server routes before changing onboarding.

## Feature inventory

| Area | Evidence in current repository | Status / caution |
|---|---|---|
| Authentication | Client login/register calls and token storage are present | Implemented path exists; session lifecycle and recovery need separate verification |
| Couple pairing | Home requests the current couple and the README lists pairing | Verify invite expiry, replay, concurrency and membership constraints |
| Home dashboard | Upcoming event countdown, Love Tap and feature navigation are present | UI refreshed; test offline, empty, one-member and paired states |
| Messages | Client supports normal, encrypted and time-capsule message kinds | Do not equate client-side encryption flow with audited end-to-end encryption |
| Love Tap | Client sends a tap and listens for realtime tap events | Verify rate limits, duplicate events and notification behavior |
| Shared events | Client loads upcoming events and links to the events route | Confirm timezone, recurring-event and deleted-event semantics |
| Relationship feedback | README and home navigation mention ratings/assessments | Verify actual route and API before presenting as a finished capability |
| Shared activities | Home links to activity recommendations | Recommendation rules and content source need documentation from implementation |
| Location sharing | README describes consent-based sharing | Treat consent, expiry, revocation, retention and access checks as release blockers |
| Wellbeing / cycle data | README describes separate consent | Highly sensitive data: minimize collection, access, retention and notification leakage |
| Spotify | README describes integration scaffolding | Treat as scaffolding until OAuth state, callback, scopes, token storage and disconnect are verified |
| Push notifications | Client registers notifications | Provider credentials, platform behavior, payload privacy and opt-out need production verification |
| Realtime | A realtime client/server layer exists | Validate authentication, authorization, reconnect and event delivery semantics |

This table intentionally distinguishes repository evidence from production readiness. Update it only after checking both client behavior and server enforcement.

## Product principles

- **Private by default:** no public profiles, searchable relationship graphs or accidental disclosure.
- **Consent is specific:** permission for one data type or purpose does not imply permission for another.
- **Revocation is real:** turning a feature off must stop future sharing and explain what happens to already stored data.
- **No dark patterns:** do not shame users, manufacture relationship scores as objective truth, or pressure a partner to share location or health information.
- **Resilient empty states:** a new user, offline user or unpaired account should see a clear next step—not a broken dashboard.
- **Respectful language:** use warm Persian copy without overpromising encryption, safety or confidentiality.
- **Small moments over gamification:** the product should feel intimate and calm rather than competitive or addictive.

## User journeys to preserve in tests

1. Welcome → login → home.
2. Welcome → registration → home.
3. Home with no upcoming event → event route.
4. Home with an upcoming event → countdown updates and opens the correct event area.
5. Love Tap succeeds and failure states remain understandable.
6. Message creation for each message kind.
7. A user with no couple / expired invitation / rejected invitation.
8. Location and wellbeing consent on, off, revoked and unavailable.
9. Network failure during any save action.
10. Reopening the app after a session expires.

## Out of scope unless explicitly approved

- Public social feed or discoverability.
- Treating a relationship score as a clinical or objective measure.
- Background location collection without a clear, active and revocable user action.
- Claims of end-to-end encryption before the cryptographic protocol and key recovery have been independently reviewed.
