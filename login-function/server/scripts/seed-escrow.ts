import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EscrowTransaction from '../models/EscrowTransaction.js'; // Đã bỏ .js để tương thích ts-node

// Load environment variables
dotenv.config();

const MONGO_URI = 'mongodb://admin:admin@0.0.0.0:27017/';

const sampleEscrows = [
  {
    orderId: 'ORDER1001',
    buyerId: 'buyer1',
    sellerId: 'seller1',
    amount: 1000000,
    description: 'Escrow for electronics order',
    status: 'pending',
    createdAt: new Date(),
  },
  {
    orderId: 'ORDER1002',
    buyerId: 'buyer2',
    sellerId: 'seller2',
    amount: 2500000,
    description: 'Escrow for furniture order',
    status: 'paid',
    createdAt: new Date(),
    paidAt: new Date(),
    vnpayTransactionNo: 'VNPAY123456',
  },
  {
    orderId: 'ORDER1003',
    buyerId: 'buyer3',
    sellerId: 'seller3',
    amount: 500000,
    description: 'Escrow for book order',
    status: 'completed',
    createdAt: new Date(),
    paidAt: new Date(),
    completedAt: new Date(),
    vnpayTransactionNo: 'VNPAY654321',
  },
  {
    orderId: 'ORDER1004',
    buyerId: 'buyer4',
    sellerId: 'seller4',
    amount: 750000,
    description: 'Escrow for clothing order',
    status: 'refunded',
    createdAt: new Date(),
    paidAt: new Date(),
    refundedAt: new Date(),
    vnpayTransactionNo: 'VNPAY111222',
  },
];

const seedEscrowTransactions = async () => {
  try {
    if (!MONGO_URI) throw new Error('MONGO_URI not set');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    await EscrowTransaction.deleteMany({});
    await EscrowTransaction.insertMany(sampleEscrows);
    console.log('Sample escrow transactions inserted');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding escrow transactions:', err);
    process.exit(1);
  }
};

seedEscrowTransactions();
