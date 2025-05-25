import { Request, Response } from 'express';
import Dispute from '../models/Dispute.js';
import EscrowTransaction from '../models/EscrowTransaction.js';
import Notification from '../models/Notification.js';
import { v4 as uuidv4 } from 'uuid';

// Buyer initiates dispute
export const initiateDispute = async (req: Request, res: Response) => {
  try {
    const { escrowId, reason, evidence } = req.body;
    const dispute = await Dispute.create({
      escrowId,
      reason,
      status: 'open',
      history: [
        { by: 'buyer', message: evidence.message, files: evidence.files }
      ],
      createdAt: new Date()
    });
    // Lock funds
    await EscrowTransaction.findByIdAndUpdate(escrowId, { status: 'dispute' });
    // Notify seller & admin
    await Notification.create({ user_id: req.body.sellerId, message: 'A dispute has been opened.' });
    await Notification.create({ user_id: req.body.adminId, message: 'A new dispute requires review.' });
    res.json({ success: true, dispute });
  } catch (err) {
    res.status(500).json({ error: 'Failed to initiate dispute' });
  }
};

// Seller responds with evidence
export const respondDispute = async (req: Request, res: Response) => {
  try {
    const { disputeId, evidence } = req.body;
    const dispute = await Dispute.findByIdAndUpdate(
      disputeId,
      { $push: { history: { by: 'seller', message: evidence.message, files: evidence.files } }, status: 'responded' },
      { new: true }
    );
    // Notify buyer & admin
    await Notification.create({ user_id: req.body.buyerId, message: 'Seller has responded to your dispute.' });
    await Notification.create({ user_id: req.body.adminId, message: 'Seller has responded to a dispute.' });
    res.json({ success: true, dispute });
  } catch (err) {
    res.status(500).json({ error: 'Failed to respond to dispute' });
  }
};

// Admin resolves dispute
export const resolveDispute = async (req: Request, res: Response) => {
  try {
    const { disputeId, action, note } = req.body;
    const dispute = await Dispute.findByIdAndUpdate(
      disputeId,
      { status: 'resolved', decision: { by: 'admin', action, note, decidedAt: new Date() } },
      { new: true }
    );
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });
    // Release or refund funds
    const escrow = await EscrowTransaction.findById(dispute.escrowId);
    if (!escrow) return res.status(404).json({ error: 'Escrow transaction not found' });
    if (action === 'refund') escrow.status = 'refunded';
    else if (action === 'release') escrow.status = 'completed';
    await escrow.save();
    // Notify all parties
    await Notification.create({ user_id: escrow.buyerId, message: `Dispute resolved: ${action}` });
    await Notification.create({ user_id: escrow.sellerId, message: `Dispute resolved: ${action}` });
    await Notification.create({ user_id: req.body.adminId, message: 'Dispute has been resolved.' });
    res.json({ success: true, dispute });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve dispute' });
  }
};

// Get dispute status (for notification)
export const getDisputeStatus = async (req: Request, res: Response) => {
  try {
    const { disputeId } = req.params;
    const dispute = await Dispute.findById(disputeId);
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });
    res.json({ status: dispute.status, decision: dispute.decision });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get dispute status' });
  }
};
