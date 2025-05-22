import express from 'express';
import auth, { require2FA } from '../middleware/auth.js';
import {
  createPartner,
  getAllPartners,
  getPartnerDetails,
  regeneratePartnerToken,
  togglePartnerStatus,
  deletePartner
} from '../controllers/admin.js';

const router = express.Router();

// All admin routes require authentication (and 2FA if enabled)
// In a production environment, you might want additional admin role checking

// @route   POST api/admin/partners
// @desc    Create new partner
// @access  Private (Admin)
router.post('/partners', auth, createPartner);

// @route   GET api/admin/partners
// @desc    Get all partners
// @access  Private (Admin)
router.get('/partners', auth, getAllPartners);

// @route   GET api/admin/partners/:partnerId
// @desc    Get partner details including secret token
// @access  Private (Admin)
router.get('/partners/:partnerId', auth, getPartnerDetails);

// @route   POST api/admin/partners/:partnerId/regenerate-token
// @desc    Regenerate partner secret token
// @access  Private (Admin)
router.post('/partners/:partnerId/regenerate-token', auth, regeneratePartnerToken);

// @route   PUT api/admin/partners/:partnerId/toggle-status
// @desc    Toggle partner active status
// @access  Private (Admin)
router.put('/partners/:partnerId/toggle-status', auth, togglePartnerStatus);

// @route   DELETE api/admin/partners/:partnerId
// @desc    Delete partner (only if no transactions)
// @access  Private (Admin)
router.delete('/partners/:partnerId', auth, deletePartner);

export default router;
