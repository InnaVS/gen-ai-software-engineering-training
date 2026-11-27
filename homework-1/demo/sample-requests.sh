#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE_URL:-http://localhost:3000}"

echo "== Health =="
curl -s "$BASE/health" | python3 -m json.tool

echo
echo "== Create deposit =="
curl -s -X POST "$BASE/transactions" \
  -H "Content-Type: application/json" \
  -d '{"toAccount":"ACC-12345","amount":500,"currency":"USD","type":"deposit"}' \
  | python3 -m json.tool

echo
echo "== Create transfer =="
TRANSFER="$(curl -s -X POST "$BASE/transactions" \
  -H "Content-Type: application/json" \
  -d '{"fromAccount":"ACC-12345","toAccount":"ACC-67890","amount":100.50,"currency":"USD","type":"transfer"}')"
echo "$TRANSFER" | python3 -m json.tool
TX_ID="$(python3 -c "import json,sys; print(json.load(sys.stdin)['id'])" <<<"$TRANSFER")"

echo
echo "== Validation error =="
curl -s -X POST "$BASE/transactions" \
  -H "Content-Type: application/json" \
  -d '{"fromAccount":"bad","toAccount":"x","amount":-1.999,"currency":"FAKE","type":"transfer"}' \
  | python3 -m json.tool

echo
echo "== List all =="
curl -s "$BASE/transactions" | python3 -m json.tool

echo
echo "== Filter accountId=ACC-12345 =="
curl -s "$BASE/transactions?accountId=ACC-12345" | python3 -m json.tool

echo
echo "== Get by id =="
curl -s "$BASE/transactions/$TX_ID" | python3 -m json.tool

echo
echo "== Balance =="
curl -s "$BASE/accounts/ACC-12345/balance" | python3 -m json.tool

echo
echo "== Summary =="
curl -s "$BASE/accounts/ACC-12345/summary" | python3 -m json.tool
