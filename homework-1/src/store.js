/** In-memory transaction store (Task 1 — no database). */
const transactions = [];

function getAll() {
  return transactions;
}

function getById(id) {
  return transactions.find((t) => t.id === id) || null;
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

module.exports = {
  getAll,
  getById,
  add,
  getBalance,
};
