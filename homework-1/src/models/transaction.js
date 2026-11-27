const { v4: uuidv4 } = require('uuid');

const VALID_TYPES = ['deposit', 'withdrawal', 'transfer'];
const VALID_STATUSES = ['pending', 'completed', 'failed'];

/**
 * Create a transaction object with generated id and timestamp.
 * @param {object} data - Request body fields
 * @returns {object} Transaction
 */
function createTransaction(data) {
  return {
    id: uuidv4(),
    fromAccount: data.fromAccount,
    toAccount: data.toAccount,
    amount: Number(data.amount),
    currency: data.currency,
    type: data.type,
    timestamp: new Date().toISOString(),
    status: data.status && VALID_STATUSES.includes(data.status)
      ? data.status
      : 'completed',
  };
}

module.exports = {
  createTransaction,
  VALID_TYPES,
  VALID_STATUSES,
};
