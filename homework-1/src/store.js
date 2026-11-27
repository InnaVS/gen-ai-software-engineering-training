/** In-memory transaction store (Task 1 — no database). */
const transactions = [];

function getAll() {
  return transactions;
}

function getById(id) {
  return transactions.find((t) => t.id === id) || null;
}

/**
 * Filter transactions by optional accountId, type, and date range (from/to).
 * Account match: fromAccount or toAccount equals accountId.
 * Dates compare against transaction.timestamp (ISO 8601).
 */
function filter({ accountId, type, from, to } = {}) {
  return transactions.filter((t) => {
    if (accountId) {
      const matchesAccount =
        t.fromAccount === accountId || t.toAccount === accountId;
      if (!matchesAccount) return false;
    }

    if (type && t.type !== type) return false;

    if (from) {
      const fromTime = new Date(from).getTime();
      if (Number.isNaN(fromTime) || new Date(t.timestamp).getTime() < fromTime) {
        return false;
      }
    }

    if (to) {
      const toDate = new Date(to);
      if (Number.isNaN(toDate.getTime())) return false;
      // Inclusive end-of-day when only a date (YYYY-MM-DD) is provided
      if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
        toDate.setUTCHours(23, 59, 59, 999);
      }
      if (new Date(t.timestamp).getTime() > toDate.getTime()) return false;
    }

    return true;
  });
}

function add(transaction) {
  transactions.push(transaction);
  return transaction;
}

/** Add an amount to the running total of its currency. */
function addToCurrency(totals, currency, amount) {
  totals[currency] = (totals[currency] || 0) + amount;
}

/** Completed transactions involving an account. Pending and failed ones never count. */
function getCompleted(accountId) {
  return filter({ accountId }).filter((t) => t.status === 'completed');
}

/**
 * Balances for an account, grouped by currency (no conversion between them):
 * deposits/incoming transfers credit, withdrawals/outgoing transfers debit.
 */
function getBalance(accountId) {
  const balances = {};

  for (const t of getCompleted(accountId)) {
    if (t.type === 'deposit' && t.toAccount === accountId) {
      addToCurrency(balances, t.currency, t.amount);
    } else if (t.type === 'withdrawal' && t.fromAccount === accountId) {
      addToCurrency(balances, t.currency, -t.amount);
    } else if (t.type === 'transfer') {
      if (t.toAccount === accountId) addToCurrency(balances, t.currency, t.amount);
      if (t.fromAccount === accountId) addToCurrency(balances, t.currency, -t.amount);
    }
  }

  return balances;
}

/**
 * Account summary: total deposits and withdrawals grouped by currency,
 * transaction count, and most recent transaction date (Task 4 Option A).
 * Only completed transactions are included, matching getBalance.
 */
function getSummary(accountId) {
  const related = getCompleted(accountId);

  const totalDeposits = {};
  const totalWithdrawals = {};
  let mostRecentTransactionDate = null;

  for (const t of related) {
    if (t.type === 'deposit' && t.toAccount === accountId) {
      addToCurrency(totalDeposits, t.currency, t.amount);
    } else if (t.type === 'withdrawal' && t.fromAccount === accountId) {
      addToCurrency(totalWithdrawals, t.currency, t.amount);
    } else if (t.type === 'transfer') {
      // Incoming transfer counts as deposit-like credit; outgoing as withdrawal-like debit
      if (t.toAccount === accountId) addToCurrency(totalDeposits, t.currency, t.amount);
      if (t.fromAccount === accountId) addToCurrency(totalWithdrawals, t.currency, t.amount);
    }

    if (
      !mostRecentTransactionDate ||
      new Date(t.timestamp) > new Date(mostRecentTransactionDate)
    ) {
      mostRecentTransactionDate = t.timestamp;
    }
  }

  return {
    accountId,
    totalDeposits,
    totalWithdrawals,
    numberOfTransactions: related.length,
    mostRecentTransactionDate,
  };
}

module.exports = {
  getAll,
  getById,
  filter,
  add,
  getBalance,
  getSummary,
};
