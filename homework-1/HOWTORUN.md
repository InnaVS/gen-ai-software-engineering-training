# ▶️ How to Run — Homework 1 Banking API

## Prerequisites

- **Node.js** 18+ (tested with Node 20)
- **npm** 9+

Check versions:

```bash
node -v
npm -v
```

## Install

```bash
cd homework-1
npm install
```

## Start the server

```bash
npm start
```

Or with auto-restart on file changes:

```bash
npm run dev
```

You should see:

```text
Banking Transactions API listening on http://localhost:3000
```

Default port is `3000`. Override with:

```bash
PORT=3080 npm start
```

## Demo script

From `homework-1/`:

```bash
chmod +x demo/run.sh
./demo/run.sh
```

This installs dependencies if needed and starts the API.

## Smoke test

```bash
# Health
curl http://localhost:3000/health

# Create a transfer
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "fromAccount": "ACC-12345",
    "toAccount": "ACC-67890",
    "amount": 100.50,
    "currency": "USD",
    "type": "transfer"
  }'

# List / filter
curl http://localhost:3000/transactions
curl "http://localhost:3000/transactions?accountId=ACC-12345"
curl "http://localhost:3000/transactions?type=transfer"
curl "http://localhost:3000/transactions?from=2024-01-01&to=2030-12-31"

# Balance & summary
curl http://localhost:3000/accounts/ACC-12345/balance
curl http://localhost:3000/accounts/ACC-12345/summary
```

More examples: [`demo/sample-requests.http`](demo/sample-requests.http) (VS Code REST Client) and [`demo/sample-requests.sh`](demo/sample-requests.sh).

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP listen port |

No `.env` file is required. Data is **in-memory** and resets when the process stops.

## Testing guide

1. Start the server (`npm start`).
2. Run `demo/sample-requests.sh` or import `demo/sample-requests.http`.
3. Confirm:
   - Valid `POST` → `201`
   - Invalid amount / account / currency → `400` with `details`
   - Unknown transaction id → `404`
   - Filters and summary return expected subsets / totals
