# Hamqadam / RelationshipTracker

A privacy-first shared relationship space built with Expo / React Native, with the same UI/UX available on iOS, Android, and Web.

## Engineering handbook

The docs folder now contains the working product and engineering guide:

- [Product and feature map](docs/PRODUCT_AND_FEATURES.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Design system and UI quality bar](docs/DESIGN_SYSTEM.md)
- [Local development](docs/DEVELOPMENT.md)
- [API and data model](docs/API_DATA_MODEL.md)
- [Security and privacy](docs/SECURITY_PRIVACY.md)
- [Testing and release checklist](docs/TESTING_RELEASE.md)
- [Roadmap and decisions](docs/ROADMAP_AND_DECISIONS.md)
- [Documentation index](docs/README.md)

## Local Mac testing — recommended Web mode

The easiest way to test the product on a Mac is the **Web build**. Docker runs PostgreSQL and the API, while the same Expo UI runs in Safari or Chrome.

### One-command Docker stack

    bash scripts/local-mac.sh up

Then open:

    http://127.0.0.1:8080

API health:

    http://127.0.0.1:4000/health

The local stack contains:
- PostgreSQL 16
- RelationshipTracker API
- Expo Web production build served by Nginx

### Open only the Web app

    bash scripts/local-mac.sh web

This builds and starts the containers and opens the app in the default Mac browser.

### Native Expo Web development mode

For hot reload while developing UI:

    bash scripts/local-mac.sh native-web

This runs Expo Web locally and points it to the containerized API at http://127.0.0.1:4000.

### Local smoke test

    bash scripts/local-mac.sh smoke

### Stop everything

    bash scripts/local-mac.sh down

## Architecture

    Safari / Chrome / iOS / Android
                  |
                  v
        Expo Router / React Native UI
                  |
                  v
             RelationshipTracker API
                  |
                  v
              PostgreSQL 16

The mobile UI and Web UI share the same React Native component tree and navigation structure. Web-specific adaptations are limited to browser capabilities such as token storage and device notifications.

## Included product areas

- Couple pairing and authentication
- Normal, encrypted, and time-capsule messages
- Love Tap
- Shared events and countdowns
- Relationship score and anti-abuse logic
- Periodic relationship assessments
- Shared activity recommendations
- Consent-based location sharing
- Cycle/wellbeing data with separate consent
- Spotify integration scaffolding
- Realtime API layer

Feature presence is not the same as production readiness. Read the security and testing guides before public release.

## Before production

Use audited end-to-end encryption libraries, real production secrets, strict CORS, HTTPS/WSS, audited authentication, consent/revocation enforcement, production Spotify credentials, proper push notification credentials, and a security/privacy review before release.
