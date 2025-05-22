import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface IPartner extends Document {
  name: string;
  email: string;
  companyName: string;
  secretToken: string;
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
  generateSecretToken(): string;
}

const PartnerSchema = new Schema<IPartner>({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true
  },
  secretToken: {
    type: String,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: Date
});

// Generate secret token method
PartnerSchema.methods.generateSecretToken = async function(): Promise<string> {
  let tokenExists = true;
  let newToken = '';

  // Keep generating until we get a unique token
  while (tokenExists) {
    newToken = crypto.randomBytes(32).toString('hex');
    const existingPartner = await mongoose.model('Partner').findOne({ secretToken: newToken });
    tokenExists = !!existingPartner;
  }

  this.secretToken = newToken;
  return newToken;
};

// Pre-save middleware to generate token if not exists
PartnerSchema.pre('save', async function(this: IPartner, next) {
  // Generate token if it doesn't exist or is empty
  if (!this.secretToken) {
    let tokenExists = true;
    let newToken = '';

    // Keep generating until we get a unique token
    while (tokenExists) {
      newToken = crypto.randomBytes(32).toString('hex');
      const existingPartner = await mongoose.model('Partner').findOne({ secretToken: newToken });
      tokenExists = !!existingPartner;
    }

    this.secretToken = newToken;
  }
  next();
});

export default mongoose.model<IPartner>('Partner', PartnerSchema);
