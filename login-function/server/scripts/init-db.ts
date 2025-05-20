import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected...');
  } catch (err: any) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

const seedDatabase = async (): Promise<void> => {
  try {
    // Clear existing data
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      isTwoFactorEnabled: false
    });

    await adminUser.save();
    console.log('Admin user created');

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      isTwoFactorEnabled: false
    });

    await testUser.save();
    console.log('Test user created');

    console.log('Database seeded successfully');
  } catch (err: any) {
    console.error('Error seeding database:', err.message);
  }
};

const run = async (): Promise<void> => {
  try {
    await connectDB();
    await seedDatabase();
    console.log('Database initialization complete');
    process.exit(0);
  } catch (err: any) {
    console.error('Initialization failed:', err.message);
    process.exit(1);
  }
};

run();
