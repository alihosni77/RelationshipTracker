# RelationshipTracker

A privacy-first cross-platform relationship companion for two people.

## Planned modules

- Couple pairing and authentication
- Normal, encrypted, and time-capsule messages
- Shared Spotify playlists and synchronized playback state
- Love Tap haptic notifications
- Shared events and countdowns
- Optional cycle tracking with controlled partner visibility
- Relationship ratings with anti-abuse scoring
- Periodic relationship assessments
- Shared activity/date recommendations
- Consent-based partner location sharing

## Architecture

- React Native + Expo + TypeScript
- Expo Router
- Zustand for local state
- TanStack Query for server state
- Supabase for auth, PostgreSQL, realtime, and edge functions
- Spotify Web API integration

## Privacy principles

1. Location sharing is always opt-in and revocable.
2. Cycle data is private by default and shared only with explicit permission.
3. Encrypted messages are designed so the server never needs plaintext.
4. Relationship scores are feedback signals, not control mechanisms.

## Development

```bash
npm install
npx expo start
```

Create a `.env` file from `.env.example` before connecting Supabase.
