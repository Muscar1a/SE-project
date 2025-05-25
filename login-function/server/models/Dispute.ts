import mongoose, { Schema, Document } from 'mongoose';

export interface Evidence {
  by: 'buyer' | 'seller';
  message: string;
  files: string[]; // file paths
  createdAt?: Date;
}

export interface Decision {
  by: 'admin';
  action: 'refund' | 'release';
  note?: string;
  decidedAt?: Date;
}

export interface DisputeDocument extends Document {
  escrowId: Schema.Types.ObjectId;
  status: 'open' | 'responded' | 'resolved';
  reason: string;
  history: Evidence[];
  decision?: Decision;
  createdAt: Date;
}

const EvidenceSchema = new Schema<Evidence>({
  by: { type: String, enum: ['buyer', 'seller'], required: true },
  message: { type: String },
  files: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const DecisionSchema = new Schema<Decision>({
  by: { type: String, enum: ['admin'], required: true },
  action: { type: String, enum: ['refund', 'release'], required: true },
  note: { type: String },
  decidedAt: { type: Date, default: Date.now }
});

const DisputeSchema = new Schema<DisputeDocument>({
  escrowId: { type: Schema.Types.ObjectId, ref: 'EscrowTransaction', required: true },
  status: { type: String, enum: ['open', 'responded', 'resolved'], default: 'open' },
  reason: { type: String, required: true },
  history: [EvidenceSchema],
  decision: DecisionSchema,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<DisputeDocument>('Dispute', DisputeSchema);
