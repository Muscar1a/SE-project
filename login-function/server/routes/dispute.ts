import { Router } from 'express';
import { initiateDispute, respondDispute, resolveDispute, getDisputeStatus, listAllDisputes } from '../controllers/dispute.js';
import Dispute from '../models/Dispute.js'; // Import the Dispute model

const router = Router();

// Buyer initiates dispute
router.post('/initiate', initiateDispute);
// Seller responds
router.post('/respond', respondDispute);
// Admin resolves
router.post('/resolve', resolveDispute);
// Get dispute status
router.get('/:disputeId/status', getDisputeStatus);
// Admin: List all disputes (không cần middleware admin)
router.get('/all', listAllDisputes);
// Get dispute details (with escrow populated)
router.get('/:disputeId', async (req, res) => {
  try {
    const { disputeId } = req.params;
    const dispute = await Dispute.findById(disputeId).populate('escrowId');
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });
    res.json({ success: true, dispute });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get dispute details' });
  }
});
// Update dispute status/result
router.patch('/:disputeId', async (req, res) => {
  // Sử dụng controller updateDispute
  const { updateDispute } = await import('../controllers/dispute.js');
  return updateDispute(req, res);
});

export default router;
