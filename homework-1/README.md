# 🏦 Homework 1: Banking Transactions API

> **Student Name**: InnaVS  
> **Date Submitted**: 2026-11-27  
> **AI Tools Used**: Cursor (Composer / Agent)

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
| `GET` | `/accounts/:accountId/balance` | Current balance |
| `GET` | `/accounts/:accountId/summary` | Deposits, withdrawals, count, latest date |
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

---

## 🤖 How AI Was Used

Development was done **task-by-task** in Cursor Agent (this chat), not as a single “generate the whole app” prompt.

1. **Task 1** — Scaffold Express app, in-memory store, four core endpoints, basic positive-amount checks  
2. **Task 2** — Extract `transactionValidator.js` (2 decimal places, `ACC-XXXXX`, ISO currencies)  
3. **Task 3** — Query filters on `GET /transactions` with combined filters and bad-query `400`s  
4. **Task 4** — Account summary endpoint (Option A)  
5. **Docs / demos / screenshots** — README, HOWTORUN, `demo/` scripts, evidence images  

**What I verified myself:** smoke-tested each task with `curl` (status codes, balances, filters, validation details) before moving on. AI-generated code was reviewed and adjusted (e.g. inclusive end dates, transfer credits/debits in summary).

Screenshots of the workflow and live API responses are in [`docs/screenshots/`](docs/screenshots/):

| File | What it shows |
|------|----------------|
| `ai-prompt-1.png` / `ai-prompt-2.png` | Cursor Agent prompts used for Tasks 1–5 |
| `api-running.png` | Server up + `GET /health` → `200` |
| `api-requests.png` | Sample create / balance / summary responses |
| `api-validation-filter.png` | Validation `400` + filtered list |

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
