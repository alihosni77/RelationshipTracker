# Hamqadam / RelationshipTracker

A privacy-first shared relationship space built with Expo / React Native, with the same UI/UX available on iOS, Android, and Web.

## Local Mac testing — recommended Web mode

The easiest way to test the product on a Mac is the **Web build**. Docker runs PostgreSQL and the API, while the same Expo UI runs in Safari or Chrome.

### One-command Docker stack

```bash
bash scripts/local-mac.sh up
```

Then open:

```text
http://127.0.0.1:8080
```

API health:

```text
http://127.0.0.1:4000/health
```

The local stack contains:

- PostgreSQL 16
- RelationshipTracker API
- Expo Web production build served by Nginx

### Open only the Web app

```bash
bash scripts/local-mac.sh web
```

This builds and starts the containers and opens the app in the default Mac browser.

### Native Expo Web development mode

For hot reload while developing UI:

```bash
bash scripts/local-mac.sh native-web
```

This runs Expo Web locally and points it to the containerized API at `http://127.0.0.1:4000`.

### Local smoke test

```bash
bash scripts/local-mac.sh smoke
```

### Stop everything

```bash
bash scripts/local-mac.sh down
```

## Architecture

```text
Safari / Chrome on Mac
        │
        ▼
   Expo Web UI
        │
        ▼
  localhost:4000
        │
        ▼
RelationshipTracker API
        │
        ▼
 PostgreSQL 16
```

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

## Before production

Use audited end-to-end encryption libraries, real production secrets, strict CORS, HTTPS/WSS, audited authentication, consent/revocation enforcement, production Spotify credentials, proper push notification credentials, and a security/privacy review before release.
