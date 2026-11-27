const express = require('express');
const store = require('../store');

const router = express.Router();

/** GET /accounts/:accountId/balance — get account balance */
router.get('/:accountId/balance', (req, res) => {
  const { accountId } = req.params;

  if (!accountId || !accountId.trim()) {
    return res.status(400).json({ error: 'Account ID is required' });
  }

  const balance = store.getBalance(accountId);

  return res.status(200).json({
    accountId,
    balance,
    currency: 'USD',
  });
});

/** GET /accounts/:accountId/summary — Task 4 Option A */
router.get('/:accountId/summary', (req, res) => {
  const { accountId } = req.params;

  if (!accountId || !accountId.trim()) {
    return res.status(400).json({ error: 'Account ID is required' });
  }

  return res.status(200).json(store.getSummary(accountId));
});

module.exports = router;
