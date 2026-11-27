const { VALID_TYPES } = require('../models/transaction');

/** Common ISO 4217 currency codes */
const VALID_CURRENCIES = new Set([
  'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD',
  'CNY', 'HKD', 'SGD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK',
  'HUF', 'RON', 'BGN', 'TRY', 'INR', 'KRW', 'BRL', 'MXN',
  'ZAR', 'RUB', 'AED', 'SAR', 'ILS', 'THB', 'MYR', 'IDR',
  'PHP', 'VND', 'UAH',
]);

/** ACC-XXXXX — exactly 5 alphanumeric characters after the prefix */
const ACCOUNT_PATTERN = /^ACC-[A-Za-z0-9]{5}$/;

function hasAtMostTwoDecimals(value) {
  const str = String(value).trim();
  if (/^-?\d+(\.\d+)?$/.test(str)) {
    const parts = str.split('.');
    return parts.length === 1 || parts[1].length <= 2;
  }
  // Numeric input that may stringify with float noise
  if (typeof value === 'number' && Number.isFinite(value)) {
    const scaled = value * 100;
    return Math.abs(scaled - Math.round(scaled)) < 1e-8;
  }
  return false;
}

function validateAccount(field, value, errors) {
  if (value === undefined || value === null || value === '') {
    errors.push({ field, message: `${field} is required` });
    return;
  }
  if (typeof value !== 'string' || !ACCOUNT_PATTERN.test(value)) {
    errors.push({
      field,
      message: `${field} must match format ACC-XXXXX (5 alphanumeric characters)`,
    });
  }
}

/**
 * Validate POST /transactions body.
 * @returns {Array<{field: string, message: string}>}
 */
function validateTransaction(body) {
  const errors = [];

  // Amount: positive, max 2 decimal places
  if (body.amount === undefined || body.amount === null || body.amount === '') {
    errors.push({ field: 'amount', message: 'Amount is required' });
  } else if (typeof body.amount === 'boolean') {
    errors.push({ field: 'amount', message: 'Amount must be a number, not a boolean' });
  } else {
    const amount = Number(body.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      errors.push({ field: 'amount', message: 'Amount must be a positive number' });
    } else if (!hasAtMostTwoDecimals(body.amount)) {
      errors.push({
        field: 'amount',
        message: 'Amount must have at most 2 decimal places',
      });
    }
  }

  // Type
  if (!body.type || !VALID_TYPES.includes(body.type)) {
    errors.push({
      field: 'type',
      message: `Type must be one of: ${VALID_TYPES.join(', ')}`,
    });
  }

  // Currency: ISO 4217
  if (!body.currency || typeof body.currency !== 'string' || !body.currency.trim()) {
    errors.push({ field: 'currency', message: 'Currency is required' });
  } else {
    const code = body.currency.trim().toUpperCase();
    if (!VALID_CURRENCIES.has(code)) {
      errors.push({ field: 'currency', message: 'Invalid currency code' });
    }
  }

  // Accounts by transaction type (format ACC-XXXXX)
  if (body.type === 'deposit') {
    validateAccount('toAccount', body.toAccount, errors);
  } else if (body.type === 'withdrawal') {
    validateAccount('fromAccount', body.fromAccount, errors);
  } else if (body.type === 'transfer') {
    validateAccount('fromAccount', body.fromAccount, errors);
    validateAccount('toAccount', body.toAccount, errors);
  }

  return errors;
}

/** Normalize currency to uppercase and amount to number before storage */
function normalizeTransactionBody(body) {
  const normalized = { ...body };
  if (typeof normalized.currency === 'string') {
    normalized.currency = normalized.currency.trim().toUpperCase();
  }
  if (normalized.amount !== undefined && normalized.amount !== null) {
    normalized.amount = Number(normalized.amount);
  }
  return normalized;
}

module.exports = {
  validateTransaction,
  normalizeTransactionBody,
  VALID_CURRENCIES,
  ACCOUNT_PATTERN,
};
