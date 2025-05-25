import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EscrowTransaction from '../models/EscrowTransaction.js';
import Dispute from '../models/Dispute.js';

// Load environment variables
dotenv.config();

const buyerId = 'buyer2';
const sellerId = 'seller2';
const adminId = 'admin';

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://admin:admin@0.0.0.0:27017/');
  console.log('Connected to MongoDB');

  // Get a paid escrow transaction
  const escrow = await EscrowTransaction.findOne({ orderId: 'ORDER1002' });
  if (!escrow) {
    console.error('No escrow found');
    process.exit(1);
  }

  // 1. Initiate dispute
  console.log('---TEST: Initiate Dispute---');
  const dispute = await Dispute.create({
    escrowId: escrow._id,
    reason: 'Item not as described',
    status: 'open',
    history: [
      { by: 'buyer', message: 'Received wrong item', files: [] }
    ],
    createdAt: new Date()
  });
  console.log('Dispute initiated:', dispute._id);

  // 2. Seller responds
  console.log('---TEST: Seller Responds to Dispute---');
  dispute.history.push({ by: 'seller', message: 'We shipped the correct item', files: [] });
  dispute.status = 'responded';
  await dispute.save();
  console.log('Seller responded, dispute status:', dispute.status);

  // 3. Admin resolves
  console.log('---TEST: Admin Resolves Dispute---');
  dispute.status = 'resolved';
  dispute.decision = { by: 'admin', action: 'refund', note: 'Refund approved', decidedAt: new Date() };
  await dispute.save();
  console.log('Dispute resolved by admin, status:', dispute.status, 'decision:', dispute.decision);

  // 4. Check dispute status
  console.log('---TEST: Check Dispute Status---');
  const check = await Dispute.findById(dispute._id);
  if (check) {
    console.log('Dispute status:', check.status);
    console.log('Decision:', check.decision);
  } else {
    console.error('Dispute not found after resolving');
  }

  // Cleanup
  await Dispute.deleteMany({});
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
