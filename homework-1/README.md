# 🏦 Homework 1: Banking Transactions API

> **Student Name**: InnaVS  
> **Date Submitted**: 2026-11-27  
> **AI Tools Used**: Cursor (Composer / Agent), Claude Code

---

## 📋 Project Overview

A minimal **Node.js + Express** REST API for banking transactions. Storage is **in-memory** (no database). The API was built step-by-step with Cursor Agent: core CRUD endpoints first, then validation, filtering, and an account summary feature.

### Features implemented

| Task | Feature |
|------|---------|
| 1 | `POST/GET /transactions`, `GET /transactions/:id`, `GET /accounts/:accountId/balance` |
| 2 | Amount, account (`ACC-XXXXX`), and ISO 4217 currency validation with structured `400` errors |
| 3 | Filter `GET /transactions` by `accountId`, `type`, and date range (`from` / `to`) |
| 4 | **Option A** — `GET /accounts/:accountId/summary` (deposits, withdrawals, count, latest date) |

---

## 🏗️ Architecture

```
homework-1/
├── src/
│   ├── index.js                 # Express app entry
│   ├── store.js                 # In-memory store + balance / filter / summary
│   ├── models/transaction.js    # Transaction factory + allowed types/statuses
│   ├── validators/transactionValidator.js
│   └── routes/
│       ├── transactions.js
│       └── accounts.js
├── demo/                        # Run script + sample requests
└── docs/screenshots/            # Evidence of AI usage and API calls
```

**Design choices:**
- Express routers keep transaction and account concerns separate
- Validation is isolated in `validators/` so Task 2 rules stay out of route handlers
- Balance and summary logic live in the store so routes stay thin
- Status codes: `200`, `201`, `400`, `404` (plus standard Express `404`/`500` fallbacks)

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/transactions` | Create a transaction |
| `GET` | `/transactions` | List / filter transactions |
| `GET` | `/transactions/:id` | Get one transaction |
| `GET` | `/accounts/:accountId/balance` | Current balances by currency |
| `GET` | `/accounts/:accountId/summary` | Deposits and withdrawals by currency, count, latest date |
| `GET` | `/health` | Liveness check |

### Transaction model

```json
{
  "id": "uuid",
  "fromAccount": "ACC-12345",
  "toAccount": "ACC-67890",
  "amount": 100.5,
  "currency": "USD",
  "type": "deposit | withdrawal | transfer",
  "timestamp": "2026-11-27T15:00:00.000Z",
  "status": "pending | completed | failed"
}
```

### Balance and summary

Totals are grouped by currency; amounts in different currencies are never added together (no conversion). Only `completed` transactions are included, so `pending` and `failed` ones affect neither totals, the transaction count, nor the latest date. An account with no completed transactions returns empty objects.

`GET /accounts/ACC-12345/balance`

```json
{
  "accountId": "ACC-12345",
  "balances": { "USD": 399.5, "EUR": -25 }
}
```

`GET /accounts/ACC-12345/summary`

```json
{
  "accountId": "ACC-12345",
  "totalDeposits": { "USD": 500 },
  "totalWithdrawals": { "USD": 100.5, "EUR": 25 },
  "numberOfTransactions": 3,
  "mostRecentTransactionDate": "2026-11-27T15:00:00.000Z"
}
```

### Validation error shape

```json
{
  "error": "Validation failed",
  "details": [
    { "field": "amount", "message": "Amount must be a positive number" },
    { "field": "currency", "message": "Invalid currency code" }
  ]
}
```

Malformed JSON returns `400` with `{ "error": "Malformed JSON in request body" }`. A boolean `amount` returns a validation error: `Amount must be a number, not a boolean`.

---

## 🤖 How AI Was Used

Development was done **task-by-task** in Cursor Agent (this chat), not as a single “generate the whole app” prompt.

1. **Task 1** — Scaffold Express app, in-memory store, four core endpoints, basic positive-amount checks  
2. **Task 2** — Extract `transactionValidator.js` (2 decimal places, `ACC-XXXXX`, ISO currencies)  
3. **Task 3** — Query filters on `GET /transactions` with combined filters and bad-query `400`s  
4. **Task 4** — Account summary endpoint (Option A)  
5. **Docs / demos / screenshots** — README, HOWTORUN, `demo/` scripts, evidence images  
6. **Bug fixes (Claude Code)** — Claude Code found, fixed and tested three issues: mixed currencies in totals, `pending` / `failed` transactions in the summary, and wrong handling of malformed JSON and boolean amounts  

**What I verified myself:** smoke-tested each task with `curl` (status codes, balances, filters, validation details) before moving on. AI-generated code was reviewed and adjusted (e.g. inclusive end dates, transfer credits/debits in summary).

Screenshots of the workflow and live API responses are in [`docs/screenshots/`](docs/screenshots/):

| File | What it shows |
|------|----------------|
| `ai-prompt-1.png` | Cursor Agent: Task 1 prompt and the start of the generated code |
| `ai-prompt-2.png` | Claude Code: prompt asking to create the pull request |
| `api-running.png` | `GET /health` → `200` from the running server |
| `api-requests.png` | Creating transactions, then balance and summary grouped by currency |
| `api-validation-filter.png` | `400` for a boolean amount and for malformed JSON, then a filtered list (`200`) |

---

## ▶️ Run

See **[HOWTORUN.md](HOWTORUN.md)** for install, start, and test instructions.

Quick start:

```bash
cd homework-1
npm install
npm start
```

---

<div align="center">

*This project was completed as part of the GenAI and Agentic AI for Software Engineering course.*

</div>
