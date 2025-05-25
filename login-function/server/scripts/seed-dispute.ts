import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EscrowTransaction from '../models/EscrowTransaction.js';
import Dispute from '../models/Dispute.js';

dotenv.config();

const MONGO_URI = 'mongodb://admin:admin@0.0.0.0:27017/';

const sampleDisputes = [
  {
    // Dispute for ORDER1002 (paid)
    escrowOrderId: 'ORDER1002',
    reason: 'Item not as described',
    status: 'open',
    history: [
      { by: 'buyer', message: 'Received wrong item', files: [] }
    ],
    createdAt: new Date(),
  },
  {
    // Dispute for ORDER1003 (completed)
    escrowOrderId: 'ORDER1003',
    reason: 'Late delivery',
    status: 'responded',
    history: [
      { by: 'buyer', message: 'Delivery was late', files: [] },
      { by: 'seller', message: 'Sorry for the delay', files: [] }
    ],
    createdAt: new Date(),
  },
  {
    // Dispute for ORDER1004 (refunded)
    escrowOrderId: 'ORDER1004',
    reason: 'Product damaged',
    status: 'resolved',
    history: [
      { by: 'buyer', message: 'Product arrived damaged', files: [] },
      { by: 'seller', message: 'We can offer a refund', files: [] }
    ],
    decision: { by: 'admin', action: 'refund', note: 'Refund approved', decidedAt: new Date() },
    createdAt: new Date(),
  },
];

const seedDisputes = async () => {
  try {
    if (!MONGO_URI) throw new Error('MONGO_URI not set');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    await Dispute.deleteMany({});

    // Map escrowOrderId to escrowId
    for (const d of sampleDisputes) {
      const escrow = await EscrowTransaction.findOne({ orderId: d.escrowOrderId });
      if (!escrow) {
        console.warn(`Escrow not found for orderId ${d.escrowOrderId}`);
        continue;
      }
      const disputeData: {
        escrowId: any;
        reason: string;
        status: string;
        history: { by: string; message: string; files: never[]; }[];
        createdAt: Date;
        decision?: { by: string; action: string; note: string; decidedAt: Date };
      } = {
        escrowId: escrow._id,
        reason: d.reason,
        status: d.status,
        history: d.history,
        createdAt: d.createdAt,
      };
      if (d.decision) disputeData.decision = d.decision;
      await Dispute.create(disputeData);
      console.log(`Dispute created for orderId ${d.escrowOrderId}`);
    }
    console.log('Sample disputes inserted');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding disputes:', err);
    process.exit(1);
  }
};

seedDisputes();
