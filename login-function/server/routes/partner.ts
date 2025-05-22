import express from 'express';
import partnerAuth from '../middleware/partnerAuth.js';
import {
  createPartnerEscrow,
  getPartnerEscrows,
  getPartnerEscrow,
  getPartnerStats
} from '../controllers/partner.js';

const router = express.Router();

// @route   POST api/partner/escrow/create
// @desc    Create a new escrow transaction (Partner API)
// @access  Private (Partner Token Required)
router.post('/escrow/create', partnerAuth, createPartnerEscrow);

// @route   GET api/partner/escrow
// @desc    Get all partner's escrow transactions
// @access  Private (Partner Token Required)
router.get('/escrow', partnerAuth, getPartnerEscrows);

// @route   GET api/partner/escrow/:orderId
// @desc    Get specific escrow transaction
// @access  Private (Partner Token Required)
router.get('/escrow/:orderId', partnerAuth, getPartnerEscrow);

// @route   GET api/partner/stats
// @desc    Get partner dashboard statistics
// @access  Private (Partner Token Required)
router.get('/stats', partnerAuth, getPartnerStats);

// @route   GET api/partner/escrow/return
// @desc    VNPay return URL for partner transactions
// @access  Public
router.get('/escrow/return', (req, res) => {
  // This can redirect to partner's custom return URL or show a generic success page
  const { vnp_TxnRef, vnp_ResponseCode } = req.query;

  if (vnp_ResponseCode === '00') {
    res.send(`
      <html>
        <head><title>Payment Success</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #28a745;">Payment Successful!</h1>
          <p>Transaction ID: ${vnp_TxnRef}</p>
          <p>Your payment has been processed successfully.</p>
          <p>You can close this window.</p>
        </body>
      </html>
    `);
  } else {
    res.send(`
      <html>
        <head><title>Payment Failed</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #dc3545;">Payment Failed</h1>
          <p>Transaction ID: ${vnp_TxnRef}</p>
          <p>Your payment could not be processed. Please try again.</p>
          <p>You can close this window.</p>
        </body>
      </html>
    `);
  }
});

export default router;
