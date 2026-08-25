# RelationshipTracker

A cross-platform relationship companion built with Expo / React Native and a Node/PostgreSQL backend.

## Local Mac test stack

The recommended local setup keeps the backend infrastructure in Docker and runs the mobile app natively on your Mac so you can use the iOS Simulator with native haptics, notifications, location permissions, and the normal Expo toolchain.

### 1. Start PostgreSQL + API in Docker

Requirements: Docker Desktop with Compose.

```bash
bash scripts/local-mac.sh up
```

Verify the API:

```bash
curl http://127.0.0.1:4000/health
```

Expected response:

```json
{"status":"ok"}
```

Useful commands:

```bash
bash scripts/local-mac.sh ps
bash scripts/local-mac.sh logs
bash scripts/local-mac.sh test
bash scripts/local-mac.sh down
bash scripts/local-mac.sh reset
```

The local stack exposes:

- API: `http://127.0.0.1:4000`
- PostgreSQL: `localhost:54329`
- Database: `relationship_tracker`
- User: `relationship`
- Password: `relationship_dev`

These credentials are intentionally local-development-only.

### 2. Run the mobile app natively on macOS

```bash
cp .env.local.example .env.local
npm install
EXPO_PUBLIC_API_URL=http://127.0.0.1:4000 npx expo start --ios
```

The iOS Simulator can reach the Docker-published API through `127.0.0.1:4000`.

For a physical iPhone on the same LAN, replace `127.0.0.1` with your Mac's LAN IP, for example:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.20:4000 npx expo start --ios --device
```

### 3. Optional integrations

Put these in `.env.local` only when you need them:

```text
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=relationshiptracker://spotify/callback
EXPO_ACCESS_TOKEN=
```

The Docker stack does not require Spotify or Expo credentials for basic local testing.

## Architecture

```text
macOS
├── Expo / React Native (native)
│   └── iOS Simulator or physical iPhone
│
└── Docker Desktop
    ├── relationship-tracker-api :4000
    └── PostgreSQL :54329
```

## Production hardening still required

Before a public release, use production secrets, HTTPS, audited end-to-end encryption, real push credentials, Spotify production credentials, proper Apple/Google signing, secure location-sharing expiry, explicit consent/revocation, and a security review. Cycle/health data remains opt-in, minimised, and isolated from relationship scoring.
