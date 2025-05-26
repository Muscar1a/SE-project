import mongoose, { Document, Schema } from 'mongoose';
import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config();

export interface INotification extends Document {
  notification_id: string;
  user_id: string;
  message: string;
  createdDate: Date;
  readStatus: boolean;
  markAsRead(): Promise<INotification>;
}

export interface NotificationModel extends mongoose.Model<INotification> {
  sendNotification(to: string, subject: string, text: string): Promise<void>;
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

NotificationSchema.statics.sendNotification = async function (
  to: string,
  subject: string,
  text: string
): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Escrow System" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default mongoose.model<INotification, NotificationModel>('Notification', NotificationSchema);
