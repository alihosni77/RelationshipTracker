#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

case "${1:-up}" in
  up)
    docker compose -f docker-compose.local.yml up -d --build
    echo "API: http://127.0.0.1:4000/health"
    ;;
  down)
    docker compose -f docker-compose.local.yml down
    ;;
  reset)
    docker compose -f docker-compose.local.yml down -v
    docker compose -f docker-compose.local.yml up -d --build
    ;;
  logs)
    docker compose -f docker-compose.local.yml logs -f api
    ;;
  test)
    docker compose -f docker-compose.local.yml exec api npm test
    ;;
  ps)
    docker compose -f docker-compose.local.yml ps
    ;;
  *)
    echo "Usage: $0 {up|down|reset|logs|test|ps}"
    exit 1
    ;;
esac
