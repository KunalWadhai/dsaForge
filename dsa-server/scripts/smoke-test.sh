#!/usr/bin/env bash
set -euo pipefail
BASE="${BASE_URL:-http://localhost:4000}"
curl -fsS "$BASE/health"
printf "\n"
