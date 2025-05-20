import express from 'express';
import auth from '../middleware/auth.js';
import {
  createEscrow,
  getTransaction,
  completeEscrow,
  refundEscrow,
  vnpayIpn,
  vnpayReturn
} from '../controllers/escrow.js';

const router = express.Router();

// @route   POST api/escrow/create
// @desc    Create a new escrow transaction
// @access  Private
router.post('/create', auth, createEscrow);

// @route   GET api/escrow/:orderId
// @desc    Get escrow transaction details
// @access  Private
router.get('/:orderId', auth, getTransaction);

// @route   POST api/escrow/:orderId/complete
// @desc    Complete escrow and release funds to seller
// @access  Private
router.post('/:orderId/complete', auth, completeEscrow);

// @route   POST api/escrow/:orderId/refund
// @desc    Refund escrow to buyer
// @access  Private
router.post('/:orderId/refund', auth, refundEscrow);

// @route   GET api/escrow/vnpay-ipn
// @desc    VNPay IPN callback
// @access  Public
router.get('/vnpay-ipn', vnpayIpn);

// @route   GET api/escrow/vnpay-return
// @desc    VNPay return callback
// @access  Public
router.get('/vnpay-return', vnpayReturn);

export default router;
