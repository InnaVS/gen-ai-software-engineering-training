const express = require('express');
const store = require('../store');
const { createTransaction, VALID_TYPES } = require('../models/transaction');

const router = express.Router();

/**
 * Task 1 basic validation: positive amount + required fields / type.
 * Fuller validation (ACC format, ISO currency, decimals) comes in Task 2.
 */
function validateCreateBody(body) {
  const errors = [];

  if (body.amount === undefined || body.amount === null || body.amount === '') {
    errors.push({ field: 'amount', message: 'Amount is required' });
  } else {
    const amount = Number(body.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      errors.push({ field: 'amount', message: 'Amount must be a positive number' });
    }
  }

  if (!body.type || !VALID_TYPES.includes(body.type)) {
    errors.push({
      field: 'type',
      message: `Type must be one of: ${VALID_TYPES.join(', ')}`,
    });
  }

  if (!body.currency || typeof body.currency !== 'string' || !body.currency.trim()) {
    errors.push({ field: 'currency', message: 'Currency is required' });
  }

  if (body.type === 'deposit') {
    if (!body.toAccount) {
      errors.push({ field: 'toAccount', message: 'toAccount is required for deposits' });
    }
  } else if (body.type === 'withdrawal') {
    if (!body.fromAccount) {
      errors.push({
        field: 'fromAccount',
        message: 'fromAccount is required for withdrawals',
      });
    }
  } else if (body.type === 'transfer') {
    if (!body.fromAccount) {
      errors.push({
        field: 'fromAccount',
        message: 'fromAccount is required for transfers',
      });
    }
    if (!body.toAccount) {
      errors.push({
        field: 'toAccount',
        message: 'toAccount is required for transfers',
      });
    }
  }

  return errors;
}

/** POST /transactions — create a new transaction */
router.post('/', (req, res) => {
  const errors = validateCreateBody(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors,
    });
  }

  const transaction = createTransaction(req.body);
  store.add(transaction);
  return res.status(201).json(transaction);
});

/** GET /transactions — list all transactions */
router.get('/', (req, res) => {
  return res.status(200).json(store.getAll());
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
