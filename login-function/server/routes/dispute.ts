import { Router } from 'express';
import { initiateDispute, respondDispute, resolveDispute, getDisputeStatus, listAllDisputes } from '../controllers/dispute.js';
import { admin as adminAuth } from '../middleware/admin.js';

const router = Router();

// Buyer initiates dispute
router.post('/initiate', initiateDispute);
// Seller responds
router.post('/respond', respondDispute);
// Admin resolves
router.post('/resolve', resolveDispute);
// Get dispute status
router.get('/:disputeId/status', getDisputeStatus);
// Admin: List all disputes
router.get('/all', adminAuth, listAllDisputes);

export default router;
