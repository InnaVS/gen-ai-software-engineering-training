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

/**
 * Balance for an account: deposits/incoming transfers credit,
 * withdrawals/outgoing transfers debit. Only completed transactions count.
 */
function getBalance(accountId) {
  let balance = 0;

  for (const t of transactions) {
    if (t.status !== 'completed') continue;

    if (t.type === 'deposit' && t.toAccount === accountId) {
      balance += t.amount;
    } else if (t.type === 'withdrawal' && t.fromAccount === accountId) {
      balance -= t.amount;
    } else if (t.type === 'transfer') {
      if (t.toAccount === accountId) balance += t.amount;
      if (t.fromAccount === accountId) balance -= t.amount;
    }
  }

  return balance;
}

/**
 * Account summary: total deposits, total withdrawals, transaction count,
 * and most recent transaction date (Task 4 Option A).
 */
function getSummary(accountId) {
  const related = filter({ accountId });

  let totalDeposits = 0;
  let totalWithdrawals = 0;
  let mostRecentTransactionDate = null;

  for (const t of related) {
    if (t.type === 'deposit' && t.toAccount === accountId) {
      totalDeposits += t.amount;
    } else if (t.type === 'withdrawal' && t.fromAccount === accountId) {
      totalWithdrawals += t.amount;
    } else if (t.type === 'transfer') {
      // Incoming transfer counts as deposit-like credit; outgoing as withdrawal-like debit
      if (t.toAccount === accountId) totalDeposits += t.amount;
      if (t.fromAccount === accountId) totalWithdrawals += t.amount;
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
