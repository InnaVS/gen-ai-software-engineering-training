const express = require('express');
const store = require('../store');
const { createTransaction, VALID_TYPES } = require('../models/transaction');
const {
  validateTransaction,
  normalizeTransactionBody,
} = require('../validators/transactionValidator');

const router = express.Router();

function validateListQuery(query) {
  const errors = [];
  const { accountId, type, from, to } = query;

  if (type !== undefined && type !== '' && !VALID_TYPES.includes(type)) {
    errors.push({
      field: 'type',
      message: `Type must be one of: ${VALID_TYPES.join(', ')}`,
    });
  }

  if (from !== undefined && from !== '' && Number.isNaN(new Date(from).getTime())) {
    errors.push({ field: 'from', message: 'from must be a valid date (ISO 8601)' });
  }

  if (to !== undefined && to !== '' && Number.isNaN(new Date(to).getTime())) {
    errors.push({ field: 'to', message: 'to must be a valid date (ISO 8601)' });
  }

  if (
    from &&
    to &&
    !Number.isNaN(new Date(from).getTime()) &&
    !Number.isNaN(new Date(to).getTime()) &&
    new Date(from).getTime() > new Date(to).getTime()
  ) {
    errors.push({ field: 'from', message: 'from must be before or equal to to' });
  }

  if (accountId !== undefined && accountId !== '' && typeof accountId !== 'string') {
    errors.push({ field: 'accountId', message: 'accountId must be a string' });
  }

  return errors;
}

/** POST /transactions — create a new transaction */
router.post('/', (req, res) => {
  const errors = validateTransaction(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors,
    });
  }

  const transaction = createTransaction(normalizeTransactionBody(req.body));
  store.add(transaction);
  return res.status(201).json(transaction);
});

/** GET /transactions — list / filter transactions */
router.get('/', (req, res) => {
  const errors = validateListQuery(req.query);
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors,
    });
  }

  const { accountId, type, from, to } = req.query;
  const hasFilters = accountId || type || from || to;

  const results = hasFilters
    ? store.filter({ accountId, type, from, to })
    : store.getAll();

  return res.status(200).json(results);
});

/** GET /transactions/:id — get a specific transaction */
router.get('/:id', (req, res) => {
  const transaction = store.getById(req.params.id);
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  return res.status(200).json(transaction);
});

module.exports = router;
