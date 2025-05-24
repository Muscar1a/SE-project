import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  notification_id: string;
  user_id: string;
  message: string;
  createdDate: Date;
  readStatus: boolean;
  markAsRead(): void;
  sendNotification(): void;
}

const NotificationSchema = new Schema<INotification>({
  notification_id: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  readStatus: {
    type: Boolean,
    default: false
  }
});

NotificationSchema.methods.markAsRead = function () {
  this.readStatus = true;
  return this.save();
};

NotificationSchema.methods.sendNotification = function () {
  console.log(`Sending notification to user ${this.user_id}: ${this.message}`);
};

export default mongoose.model<INotification>('Notification', NotificationSchema);
