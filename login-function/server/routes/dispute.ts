import { Router } from 'express';
import { initiateDispute, respondDispute, resolveDispute, getDisputeStatus } from '../controllers/dispute.js';

const router = Router();

// Buyer initiates dispute
router.post('/initiate', initiateDispute);
// Seller responds
router.post('/respond', respondDispute);
// Admin resolves
router.post('/resolve', resolveDispute);
// Get dispute status
router.get('/:disputeId/status', getDisputeStatus);

export default router;
