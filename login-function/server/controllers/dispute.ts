import { Request, Response } from 'express';
import Dispute from '../models/Dispute.js';
import EscrowTransaction from '../models/EscrowTransaction.js';
import Notification from '../models/Notification.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';

dotenv.config();

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
    const seller = await User.findById(req.body.sellerId);
    const sellerEmail = seller?.email;
    await Notification.create({ user_id: req.body.sellerId, message: 'A dispute has been opened.' });
    if (sellerEmail) {
      await Notification.sendNotification(sellerEmail, "Escrow system", "A dispute has been opened.");
    }

    await Notification.create({ user_id: req.body.adminId, message: 'A new dispute requires review.' });
    await Notification.sendNotification(process.env.MAIL_USER as string, "Escrow System", "A new dispute requires review.")

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
    const buyer = await User.findById(req.body.buyerId);
    const buyerEmail = buyer?.email;
    await Notification.create({ user_id: req.body.buyerId, message: 'Seller has responded to your dispute.' });
    if (buyerEmail) {
      await Notification.sendNotification(buyerEmail, "Escrow system", "Seller has responded to your dispute.");
    }
    
    await Notification.create({ user_id: req.body.adminId, message: 'Seller has responded to a dispute.' });
    await Notification.sendNotification(process.env.MAIL_USER as string, "Escrow System", "Seller has responded to a dispute.")

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
    const buyer = await User.findById(escrow.buyerId);
    const buyerEmail = buyer?.email;
    await Notification.create({ user_id: escrow.buyerId, message: `Dispute resolved: ${action}` });
    if (buyerEmail) {
      await Notification.sendNotification(buyerEmail, "Escrow system", `Dispute resolved: ${action}`);
    }
    
    const seller = await User.findById(escrow.sellerId);
    const sellerEmail = seller?.email;
    await Notification.create({ user_id: escrow.sellerId, message: `Dispute resolved: ${action}` });
    if (sellerEmail) {
      await Notification.sendNotification(sellerEmail, "Escrow system", `Dispute resolved: ${action}`);
    }

    await Notification.create({ user_id: req.body.adminId, message: 'Dispute has been resolved.' });
    await Notification.sendNotification(process.env.MAIL_USER as string, "Escrow System", "Dispute has been resolved.")
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

// List all disputes (admin)
export const listAllDisputes = async (req: Request, res: Response) => {
  try {
    const disputes = await Dispute.find().populate('escrowId');
    res.json({ success: true, disputes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
};

// Update dispute status/result (admin or system)
export const updateDispute = async (req: Request, res: Response) => {
  try {
    const { disputeId } = req.params;
    const { status, decision, note } = req.body;
    const update: any = {};
    if (status) update.status = status;
    if (decision) {
      update.decision = {
        by: 'admin',
        action: decision,
        note: note || '',
        decidedAt: new Date()
      };
    }
    const dispute = await Dispute.findByIdAndUpdate(disputeId, update, { new: true }).populate('escrowId');
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });
    res.json({ success: true, dispute });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update dispute' });
  }
};
export function getAllDisputes(req2: any, res2: any) {
    throw new Error('Function not implemented.');
}

