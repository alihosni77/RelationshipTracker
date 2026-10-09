# Development guide

## Prerequisites

Use a supported Node.js version compatible with the lockfile and Expo SDK configured in package.json, plus npm, Docker and Docker Compose for the full local stack. For native device builds, install the relevant Xcode / Android tooling and follow the current Expo guidance.

Do not upgrade Expo, React Native or related packages as part of a visual-only change unless the upgrade is separately planned and tested.

## Recommended local Web stack

The root README documents the repository's local Mac script:

- Start the full local stack: bash scripts/local-mac.sh up
- Open the app at http://127.0.0.1:8080
- Check API health at http://127.0.0.1:4000/health
- Start the native Expo Web workflow: bash scripts/local-mac.sh native-web
- Run the local smoke test: bash scripts/local-mac.sh smoke
- Stop the stack: bash scripts/local-mac.sh down

Inspect scripts/local-mac.sh before changing the commands; the script is the executable source of truth.

## Useful package scripts

| Script | Purpose |
|---|---|
| npm run start | Start Expo |
| npm run web | Start Expo Web |
| npm run web:export | Export the static Web build |
| npm run web:test | Run Playwright Web tests |
| npm run typecheck | Run TypeScript without emitting files |
| npm run doctor | Run Expo diagnostics |
| npm run lint | Run Expo lint |
| npm run eas:preview | Build preview binaries |
| npm run eas:production | Build production binaries |
| npm run eas:ios:testflight | Build and submit the iOS production profile |

Confirm scripts and supported options against package.json before relying on this page after dependency changes.

## Environment variables

The client currently reads EXPO_PUBLIC_API_URL and falls back to http://127.0.0.1:4000. This fallback is suitable only for local development. Production builds must be configured with the intended HTTPS API URL.

Expo public variables are bundled into client code. Never place API secrets, signing keys, database credentials, refresh-token secrets or third-party client secrets in EXPO_PUBLIC_* variables.

Server configuration is defined by the server implementation and local stack files. Before adding or renaming variables:
1. inspect the server entry point and deployment files;
2. update a safe example environment file if one exists;
3. document whether the variable is required and whether it contains a secret;
4. validate missing and malformed values at startup;
5. keep real values in a secret manager or local ignored file.

## Recommended workflow

1. Create a short-lived branch from the intended base.
2. Read the target screen, shared theme, related services and tests.
3. Make the smallest coherent change that preserves behavior.
4. Update the docs in the same change.
5. Run typecheck, lint and relevant tests.
6. Check Web layout at narrow and wide widths; inspect iOS/Android behavior when the change is shared.
7. Review the diff for unrelated changes, secrets and accidental API changes.
8. Open a pull request with purpose, screenshots, tests and known gaps.

## Troubleshooting

- If Web cannot reach the API, verify the configured API URL, container health and browser network console.
- If login succeeds but a screen appears empty, inspect the API response and current user/couple state before changing UI assumptions.
- If Expo exports but a browser test fails, read the exact Playwright failure; a successful export is not proof that the user flow works.
- If a native-only capability fails on Web, provide an explicit supported/unsupported state rather than silently pretending it worked.
