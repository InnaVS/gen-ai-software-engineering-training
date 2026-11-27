const express = require('express');
const store = require('../store');
const { createTransaction } = require('../models/transaction');
const {
  validateTransaction,
  normalizeTransactionBody,
} = require('../validators/transactionValidator');

const router = express.Router();

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
