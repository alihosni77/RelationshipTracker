# Architecture

## System shape

The repository is a TypeScript / Expo application with a separate API and PostgreSQL persistence. The same React Native UI is intended to run on iOS, Android and Web.

Browser / iOS / Android
→ Expo Router screens and shared React Native components
→ client service modules (HTTP, realtime, notifications, cryptography)
→ TypeScript API
→ PostgreSQL

Realtime events use a separate connection path from ordinary HTTP requests. Push notifications are a distinct platform capability and should not be treated as a guaranteed realtime transport.

## Client structure observed

- **app/** — file-based routes, including the root layout, welcome, authentication, home and messages screens. Additional feature routes are referenced by navigation and should be inventoried when modifying route structure.
- **src/theme.ts** — shared design tokens.
- **src/i18n/fa.ts** — Persian interface strings used by the welcome/home screens.
- **src/services/api.ts** — HTTP wrapper, access-token storage and typed auth helpers.
- **src/services/realtime.ts** — realtime connection client.
- **src/services/notifications.ts** — push notification registration.
- **src/services/crypto.ts** — message encryption helper.
- **src/types/** — shared domain types.
- **app.json** — Expo identity, platform configuration, permissions and plugins.

## Server structure observed

- **server/src/index.ts** — API entry point and HTTP route setup.
- **server/src/security.ts** — security-related helpers.
- **server/src/session.ts** — session / token support.
- **server/src/realtime.ts** — realtime connection and event authorization.
- **server/src/features.ts** — feature-specific route or service logic.
- **server/src/spotify.ts** — Spotify integration support.
- **server/src/push.ts** — push notification support.
- SQL files / migrations define persistence constraints and must be read before changing data shape.

The list above is an orientation map, not an exhaustive file inventory. Before a refactor, inspect the current repository tree and the relevant migrations rather than relying on these notes alone.

## Boundaries and contracts

### UI
Screens own presentation and interaction state. Keep reusable colors, spacing, radii and shadows in the theme. Avoid adding another competing color palette directly inside individual screens.

### HTTP
Client requests pass through the shared API wrapper. It attaches JSON headers and an access token where available, then normalizes transport and HTTP failures. A screen must not assume a request succeeded unless the promise resolves.

### Authentication
The client stores a token differently by platform: SecureStore on native and localStorage on Web. The Web storage choice creates an XSS exposure surface; see the security document. Never log access tokens or include them in analytics.

### Realtime
The client connects using the current couple identifier and an access token. Server-side authentication alone is not enough: each event subscription and mutation must also verify that the authenticated user belongs to the requested couple and is authorized for the event.

### Persistence
The database is the authority for durable state and invariants. Business-critical rules—such as membership limits, invitation consumption and consent state—must be enforced transactionally and with database constraints where possible, not only in UI code.

## Change rules

- Keep API request/response types aligned with server validation.
- Prefer additive migrations with explicit rollback/compatibility notes.
- Do not silently change a persisted field's meaning.
- Treat dates as instants at the API boundary; define the intended display timezone in UI.
- Keep secret values out of the client bundle and public Expo environment variables.
- Document cross-platform differences explicitly.
- For security-sensitive behavior, test both the allowed path and the denied path.

## Architecture questions to resolve

- Is there a single canonical inventory of routes, request schemas and database tables?
- Which routes require an authenticated user, a couple membership, or a separate consent grant?
- How are refresh tokens revoked and how are all active sessions invalidated?
- What are the exact retention and deletion rules for messages, location and wellbeing data?
- Which server operations are transactional and which database constraints guarantee their invariants?
- What happens to realtime subscriptions when a user leaves a couple or revokes consent?
