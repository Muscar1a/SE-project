import mongoose, { Document, Schema } from 'mongoose';

// Define interface for EscrowTransaction document
export interface IEscrowTransaction extends Document {
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  description: string;
  status: 'pending' | 'paid' | 'completed' | 'refunded' | 'cancelled';
  vnpayTransactionNo?: string;
  createdAt: Date;
  paidAt?: Date;
  completedAt?: Date;
  refundedAt?: Date;
}

const EscrowTransactionSchema = new Schema<IEscrowTransaction>({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  buyerId: {
    type: String,
    required: true
  },
  sellerId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'completed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  vnpayTransactionNo: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  paidAt: Date,
  completedAt: Date,
  refundedAt: Date
});

export default mongoose.model<IEscrowTransaction>('EscrowTransaction', EscrowTransactionSchema);
