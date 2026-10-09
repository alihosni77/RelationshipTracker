# Roadmap and decisions

## Current change: visual foundation

The current design pass establishes a shared dark ink palette with restrained rose and lavender accents, a more deliberate Persian-first hierarchy, a focused welcome composition, a structured authentication form and a more editorial home dashboard.

The change is intentionally UI-focused. It should not change API contracts, persisted data or product permissions. The other feature screens inherit the updated theme but still require a screen-by-screen design pass.

## Prioritized roadmap

### P0 — verify this design change
- Run typecheck and lint.
- Run Web end-to-end tests and inspect the actual failure output if any.
- Check the welcome, auth and home screens at narrow and wide widths.
- Confirm all navigation targets still resolve.
- Review text contrast and focus states.
- Ensure the home layout remains usable with large system text and long Persian names.

### P0 — privacy and authorization before public launch
- Inventory all API routes and add object-level authorization tests.
- Review location and wellbeing consent/revocation end to end.
- Test couple/invitation concurrency with database constraints.
- Review Web token storage and XSS protections.
- Review cryptographic protocol and avoid unverified end-to-end encryption claims.
- Verify production HTTPS/WSS, CORS, secrets and rate limiting.

### P1 — unify remaining screens
- Apply shared header, card, form, empty-state and error-state patterns to messages, events, ratings, activities, location and wellbeing.
- Extract reusable Button, ScreenContainer, SectionHeader, Card and FormField components only after their contracts are clear.
- Remove repeated hardcoded colors and dimensions from feature screens.
- Add accessibility labels and consistent loading/error feedback.

### P1 — operational documentation
- Generate a complete route inventory from server route definitions.
- Document every environment variable and its sensitivity.
- Map SQL migrations to domain resources and invariants.
- Record the actual CI matrix and production deployment process.
- Define support, data deletion, backup restore and incident response.

### P2 — product maturity
- Define user-facing account deletion and data export.
- Add a documented consent history and retention policy where appropriate.
- Improve timezone handling and event edge cases.
- Define integration lifecycle for Spotify and push notifications.
- Add visual regression coverage once the design system stabilizes.

## Decisions

### D-001: One cross-platform design system
**Decision:** Keep a single shared token source in src/theme.ts for the shared React Native UI.

**Reason:** iOS, Android and Web should feel like the same product and avoid palette drift.

**Trade-off:** Platform-specific affordances may still need small adaptations, but those should not create a second visual language.

### D-002: Quiet intimacy over neon-heavy gamification
**Decision:** Use ink surfaces, restrained rose, lavender and semantic status colors.

**Reason:** The app is about private connection and reflection; loud competing accents make it feel generic and overly game-like.

### D-003: Persian-first composition
**Decision:** Treat Persian RTL as a first-class layout constraint.

**Reason:** Correct alignment, reading order, labels and arrow direction affect usability and polish.

### D-004: UI changes must preserve domain behavior
**Decision:** A visual refresh should not silently change API calls, consent semantics, route behavior or persistence.

**Reason:** UI polish must not weaken privacy or create hidden behavioral changes.

### D-005: Document observed behavior separately from plans
**Decision:** Docs explicitly mark uncertain or unverified behavior.

**Reason:** Future contributors need a trustworthy record, not optimistic assumptions.

## Decision record template

For future significant changes, record:
- ID and date;
- context / problem;
- decision;
- alternatives considered;
- security, privacy and accessibility impact;
- migration / rollout plan;
- tests and verification evidence;
- conditions for revisiting the decision.
