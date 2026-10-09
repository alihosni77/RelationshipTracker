# Hamqadam engineering handbook

This folder is the working handbook for Hamqadam / RelationshipTracker. It describes the product and the code as inspected, separates implemented behavior from ideas, and records the next verification steps so future work does not depend on chat history.

## Start here

- **Product and features** — product intent, user journeys, and feature status: [PRODUCT_AND_FEATURES.md](PRODUCT_AND_FEATURES.md)
- **Architecture** — app, API, data and realtime boundaries: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Design system** — visual principles, tokens, RTL rules and UI acceptance criteria: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
- **Development** — local setup, environment and common commands: [DEVELOPMENT.md](DEVELOPMENT.md)
- **API and data** — currently observed endpoints, domain resources and contract rules: [API_DATA_MODEL.md](API_DATA_MODEL.md)
- **Security and privacy** — threat areas, consent-sensitive features and release gates: [SECURITY_PRIVACY.md](SECURITY_PRIVACY.md)
- **Testing and release** — test commands, CI expectations and release checklist: [TESTING_RELEASE.md](TESTING_RELEASE.md)
- **Roadmap and decisions** — prioritized follow-ups and the rationale behind the current design direction: [ROADMAP_AND_DECISIONS.md](ROADMAP_AND_DECISIONS.md)

## Source-of-truth rules

1. Source code and migrations define what is implemented.
2. This handbook describes the observed state and highlights unknowns; it must not be treated as proof that a planned feature is complete.
3. When behavior changes, update the relevant documentation in the same pull request.
4. Never place credentials, access tokens, production user data, or private relationship content in documentation, screenshots, fixtures, issues, or logs.
5. Keep user-facing copy Persian-first unless the product explicitly adds a supported language.

## Current implementation snapshot

- Client: Expo / React Native with Expo Router; one shared screen tree targets iOS, Android and Web.
- Server: TypeScript API with PostgreSQL; a realtime layer is present.
- Product areas listed in the root README include pairing/authentication, messages, Love Tap, shared events, relationship feedback, activity suggestions, consent-based location, wellbeing/cycle data, Spotify integration scaffolding and push notifications.
- Some areas are described as scaffolding or need additional production hardening. Read the feature and security documents before assuming production readiness.
- The UI refresh introduces a shared ink / rose / lavender visual language and improves the welcome, authentication and home screens. Other screens inherit the new theme tokens but still need a complete screen-by-screen visual and accessibility review.

## Maintenance checklist

For every meaningful change:
- update product/architecture/API notes;
- add or update tests for changed behavior;
- record privacy and security implications;
- check Persian RTL and a narrow mobile viewport;
- run typecheck, web tests, and the relevant server tests;
- include screenshots or a concise visual QA note for UI changes;
- document anything intentionally deferred.
