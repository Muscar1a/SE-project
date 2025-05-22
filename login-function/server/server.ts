import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import escrowRoutes from './routes/escrow.js';
import partnerRoutes from './routes/partner.js';
import adminRoutes from './routes/admin.js';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app: Express = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Define Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/admin', adminRoutes);

// Serve static assets for templates
app.use('/templates', express.static(path.join(__dirname, 'templates')));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'));
  });
}

const PORT: number = parseInt(process.env.PORT || '5000', 10);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
