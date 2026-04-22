const express = require('express');
const { fundEscrow, getEscrowTransactions, createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/escrow');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/fund/:contractId', protect, fundEscrow); // Legacy mock 
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify-payment', protect, verifyRazorpayPayment);
router.get('/:contractId/transactions', protect, getEscrowTransactions);

module.exports = router;
