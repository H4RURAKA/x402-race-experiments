#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SERVICES=(daydreams elsa firecrawl heurist mogami neynar snack zyte)

if [[ $# -gt 0 ]]; then
  SERVICES=("$@")
fi

PASS=0
FAIL=0

for svc in "${SERVICES[@]}"; do
  printf "\n===== %s =====\n" "$svc"
  if npm run "$svc" --prefix "$ROOT_DIR"; then
    PASS=$((PASS + 1))
  else
    code=$?
    echo "[FAIL] $svc (exit=$code)"
    FAIL=$((FAIL + 1))
  fi
done

printf "\n[done] pass=%s fail=%s\n" "$PASS" "$FAIL"
if [[ $FAIL -gt 0 ]]; then
  exit 1
fi
