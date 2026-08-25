#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

case "${1:-up}" in
  up)
    docker compose -f docker-compose.local.yml up -d --build
    echo "Web: http://127.0.0.1:8080"
    echo "API: http://127.0.0.1:4000/health"
    ;;
  web)
    docker compose -f docker-compose.local.yml up -d --build db api web
    open "http://127.0.0.1:8080"
    ;;
  native-web)
    npm install
    EXPO_PUBLIC_API_URL="${EXPO_PUBLIC_API_URL:-http://127.0.0.1:4000}" npm run web:local
    ;;
  down)
    docker compose -f docker-compose.local.yml down
    ;;
  reset)
    docker compose -f docker-compose.local.yml down -v
    docker compose -f docker-compose.local.yml up -d --build
    ;;
  logs)
    docker compose -f docker-compose.local.yml logs -f web api
    ;;
  test)
    docker compose -f docker-compose.local.yml exec api npm test
    ;;
  smoke)
    curl --fail http://127.0.0.1:4000/health
    curl --fail http://127.0.0.1:8080/health
    echo "Local web/API smoke test passed."
    ;;
  ps)
    docker compose -f docker-compose.local.yml ps
    ;;
  *)
    echo "Usage: $0 {up|web|native-web|down|reset|logs|test|smoke|ps}"
    exit 1
    ;;
esac
