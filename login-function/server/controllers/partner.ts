import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  VNPay,
  HashAlgorithm,
  ProductCode,
  VnpLocale,
} from 'vnpay';
import EscrowTransaction from '../models/EscrowTransaction.js';
import Partner, { IPartner } from '../models/Partner.js';

// Define interfaces
interface IPartnerRequest extends Request {
  partner?: IPartner;
}

interface CreatePartnerEscrowRequest {
  customerEmail: string;
  amount: number;
  description: string;
  returnUrl?: string;
  metadata?: any;
}

// Initialize VNPay instance
const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMN_CODE || '',
  secureSecret: process.env.VNPAY_SECURE_SECRET || '',
  vnpayHost: 'https://sandbox.vnpayment.vn',
  testMode: true,
  hashAlgorithm: HashAlgorithm.SHA512,
  vnp_Locale: VnpLocale.VN
});

// Create escrow transaction for partner
export const createPartnerEscrow = async (
  req: IPartnerRequest,
  res: Response
): Promise<Response> => {
  try {
    const { customerEmail, amount, description, returnUrl, metadata } = req.body as CreatePartnerEscrowRequest;
    const partner = req.partner!;

    // Validate required fields
    if (!customerEmail || !amount || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: customerEmail, amount, description'
      });
    }

    // Validate amount
    if (amount < 1000) {
      return res.status(400).json({
        success: false,
        error: 'Minimum amount is 1,000 VND'
      });
    }

    // Generate unique order ID
    const orderId = `${partner._id.toString().slice(-6)}-${uuidv4().replaceAll('-', '').slice(0, 16)}`;

    // Create escrow transaction
    const escrowTransaction = new EscrowTransaction({
      orderId,
      buyerId: customerEmail, // Use customer email as buyer ID for partner transactions
      sellerId: partner._id.toString(),
      amount,
      description,
      status: 'pending'
    });

    await escrowTransaction.save();

    // Create VNPay payment URL
    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: req.ip || '127.0.0.1',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `${description} - Partner: ${partner.companyName}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: returnUrl || `${process.env.SERVER_URL}/api/partner/escrow/return`,
    });

    return res.json({
      success: true,
      data: {
        orderId,
        paymentUrl,
        amount,
        description,
        customerEmail,
        partner: {
          id: partner._id,
          name: partner.name,
          companyName: partner.companyName
        },
        transaction: escrowTransaction
      }
    });
  } catch (error) {
    console.error('Error creating partner escrow:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create escrow transaction'
    });
  }
};

// Get partner's escrow transactions
export const getPartnerEscrows = async (
  req: IPartnerRequest,
  res: Response
): Promise<Response> => {
  try {
    const partner = req.partner!;
    const { page = 1, limit = 10, status } = req.query;

    const query: any = { sellerId: partner._id.toString() };

    if (status && typeof status === 'string') {
      query.status = status;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const transactions = await EscrowTransaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await EscrowTransaction.countDocuments(query);

    return res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Error getting partner escrows:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve transactions'
    });
  }
};

// Get specific escrow transaction
export const getPartnerEscrow = async (
  req: IPartnerRequest,
  res: Response
): Promise<Response> => {
  try {
    const { orderId } = req.params;
    const partner = req.partner!;

    const transaction = await EscrowTransaction.findOne({
      orderId,
      sellerId: partner._id.toString()
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    return res.json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    console.error('Error getting partner escrow:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve transaction'
    });
  }
};

// Get partner dashboard stats
export const getPartnerStats = async (
  req: IPartnerRequest,
  res: Response
): Promise<Response> => {
  try {
    const partner = req.partner!;

    const stats = await EscrowTransaction.aggregate([
      { $match: { sellerId: partner._id.toString() } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const summary = {
      totalTransactions: 0,
      totalAmount: 0,
      byStatus: {} as any
    };

    stats.forEach(stat => {
      summary.totalTransactions += stat.count;
      summary.totalAmount += stat.totalAmount;
      summary.byStatus[stat._id] = {
        count: stat.count,
        amount: stat.totalAmount
      };
    });

    return res.json({
      success: true,
      data: {
        partner: {
          id: partner._id,
          name: partner.name,
          companyName: partner.companyName,
          email: partner.email,
          createdAt: partner.createdAt,
          lastUsed: partner.lastUsed
        },
        stats: summary
      }
    });
  } catch (error) {
    console.error('Error getting partner stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve stats'
    });
  }
};
