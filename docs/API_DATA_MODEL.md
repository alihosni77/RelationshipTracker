# API and data model

## Scope and confidence

This document is a working map based on the client calls and server files inspected so far. It is not a complete generated API specification. Before implementing an integration or changing persistence, inventory all server routes, validation schemas and SQL migrations and update this document with the exact request/response shapes.

## Client contract conventions

The shared client wrapper:
- uses the configured API base URL;
- sends Accept: application/json;
- sets Content-Type for requests with a body;
- adds a Bearer access token when one is stored;
- converts transport failures into a network_unavailable error;
- throws for non-success HTTP responses and returns parsed JSON for successful responses.

Screens should handle rejected promises and show a useful user-facing state. Do not display raw internal error messages if they reveal implementation details or sensitive data.

## Client endpoints observed

| Method / path | Use visible in client | Contract note |
|---|---|---|
| POST /v1/auth/register | Create account | Input includes email, password and displayName; response includes user and accessToken |
| POST /v1/auth/login | Sign in | Input includes email and password; response includes user and accessToken |
| GET /v1/me | Load current user | Response includes user |
| GET /v1/couples/me | Load current couple | Home expects couple or null |
| GET /v1/events | Load shared events | Home expects events with id, title and starts_at |
| POST /v1/love-taps | Send a Love Tap | Client posts an empty JSON object |
| GET /v1/messages | Load messages | Client expects messages with kind, ciphertext and timestamps |
| POST /v1/messages | Create a message | Client sends kind, ciphertext and optional keyEnvelope / unlockAt |

Other server endpoints may exist. The table is deliberately limited to calls confirmed in the client files inspected.

## Domain concepts

- **User:** an authenticated account with a stable identifier and display name.
- **Couple / shared space:** a relationship container with membership rules. Membership limits and invitation consumption must be enforced by the database and transactional server logic.
- **Message:** a shared item with a kind (normal, encrypted or time capsule), sender, creation time and optional unlock time / key envelope.
- **Event:** a shared date or moment with a start timestamp used by the home countdown.
- **Love Tap:** a lightweight event sent to the shared partner and surfaced through realtime behavior.
- **Consent grant:** an explicit permission record or equivalent state governing sensitive capabilities such as location or wellbeing data. Exact persistence shape must be confirmed from migrations.
- **Third-party connection:** an integration such as Spotify whose authorization and stored credentials need a separate lifecycle.

## Contract rules

- Validate all incoming data on the server; client-side validation is for usability only.
- Treat user IDs, couple IDs and message IDs from the client as untrusted selectors.
- Authorize each object access against the authenticated principal and current membership.
- Use database transactions and constraints for invariants that must survive concurrent requests.
- Define timestamp format and timezone semantics explicitly; store instants consistently and localize only at presentation time.
- Keep encryption metadata and ciphertext handling consistent across create, fetch, export and deletion paths.
- Do not return private content to notification payloads unless the user explicitly opts in and the privacy risk is clearly explained.
- Version breaking API changes and update client types and tests together.

## Database inventory still required

For each migration / SQL file, record:
- table and column names;
- primary, foreign and unique constraints;
- cascade behavior;
- indexes;
- sensitive fields and retention policy;
- whether an invariant is enforced in SQL or only in application logic;
- migration ordering and rollback strategy.

A complete API reference should eventually be generated from the server route definitions and validation schemas, not maintained from client usage alone.
