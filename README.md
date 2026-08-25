# RelationshipTracker

An Expo / React Native starter for a consent-first shared relationship space.

## Included in this iteration

- A polished shared dashboard with event countdown.
- Love Tap feedback with local haptics; server delivery can be added behind the same action.
- Message composer with normal, secret, and time-capsule modes.
- A relationship-score helper designed to limit one-sided scoring (minimum responses, equal per-person influence, recency weighting, disagreement penalty).
- Privacy-oriented product boundaries for location and cycle-aware features.

## Run locally

```bash
npm install
npm run start
```

## Before production

Add authenticated backend storage, end-to-end encryption using audited libraries, server-enforced time-capsule unlocks, push notifications, explicit per-feature consent and revocation, Spotify OAuth, and secure location-sharing expiry. Health/cycle data should be opt-in, minimised, and never used for relationship scoring.
