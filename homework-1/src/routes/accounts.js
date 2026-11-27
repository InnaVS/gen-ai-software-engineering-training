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

module.exports = router;
