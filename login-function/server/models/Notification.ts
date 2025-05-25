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

NotificationSchema.methods.sendNotification = async function (
  to: string,
  subject: string,
  text: string
): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Escrow System" <${process.env.EMAIL_USER}>`,
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

export default mongoose.model<INotification>('Notification', NotificationSchema);
