import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    InpOrderAlreadyConfirmed,
    IpnFailChecksum,
    IpnInvalidAmount,
    IpnOrderNotFound,
    type IpnResponse,
    IpnSuccess,
    IpnUnknownError,
    VNPay,
    HashAlgorithm,
    ProductCode,
    RefundTransactionType,
    VnpLocale,
    type ReturnQueryFromVNPay,
    type VerifyReturnUrl,
    dateFormat,
    getDateInGMT7,
} from 'vnpay';
import EscrowTransaction, { IEscrowTransaction } from '../models/EscrowTransaction.js';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define interfaces for request bodies
interface CreateEscrowRequest {
  buyerId: string;
  sellerId: string;
  amount: number;
  description?: string;
}

interface RefundEscrowRequest {
  reason?: string;
}

// Define interfaces for VNPay responses
interface VNPayVerifyResult {
  isVerified: boolean;
  isSuccess?: boolean;
  vnp_Amount?: number;
  vnp_TxnRef?: string;
  vnp_TransactionNo?: number;
  vnp_BankCode?: string;
  [key: string]: any;
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

// Create a new escrow transaction
export const createEscrow = async (req: Request<{}, {}, CreateEscrowRequest>, res: Response): Promise<Response> => {
  try {
    const { buyerId, sellerId, amount, description } = req.body;

    if (!buyerId || !sellerId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate a unique order ID
    const orderId = uuidv4().replaceAll('-', '');

    // Create new transaction
    const escrowTransaction = new EscrowTransaction({
      orderId,
      buyerId,
      sellerId,
      amount,
      description: description || `Escrow payment for order ${orderId}`,
      status: 'pending'
    });

    await escrowTransaction.save();

    // Create payment URL
    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: req.ip || '127.0.0.1',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: description || `Escrow payment for order ${orderId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: `${process.env.SERVER_URL}/api/escrow/vnpay-return`,
    });

    return res.json({
      success: true,
      orderId,
      paymentUrl,
      escrowTransaction
    });
  } catch (error) {
    console.error('Error creating escrow:', error);
    return res.status(500).json({ error: 'Failed to create escrow transaction' });
  }
};

// Get escrow transaction details
export const getTransaction = async (req: Request<{orderId: string}>, res: Response): Promise<Response> => {
  try {
    const { orderId } = req.params;
    const transaction = await EscrowTransaction.findOne({ orderId });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Query VNPay for latest transaction status if paid
    if (transaction.vnpayTransactionNo && transaction.status === 'paid') {
      try {
        const queryResult = await vnpay.queryDr({
          vnp_CreateDate: dateFormat(transaction.createdAt),
          vnp_IpAddr: req.ip || '127.0.0.1',
          vnp_OrderInfo: `Escrow payment for order ${orderId}`,
          vnp_RequestId: `QUERY-${Date.now()}`,
          vnp_TransactionDate: dateFormat(transaction.paidAt || new Date()),
          vnp_TransactionNo: Number(transaction.vnpayTransactionNo),
          vnp_TxnRef: orderId,
        });

        return res.json({
          transaction,
          vnpayStatus: queryResult
        });
      } catch (error) {
        console.error('Error querying VNPay:', error);
      }
    }

    return res.json({ transaction });
  } catch (error) {
    console.error('Error retrieving transaction:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Complete escrow and release funds to seller
export const completeEscrow = async (req: Request<{orderId: string}>, res: Response): Promise<Response> => {
  try {
    const { orderId } = req.params;
    const transaction = await EscrowTransaction.findOne({ orderId });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'paid') {
      return res.status(400).json({ error: 'Transaction not in paid status' });
    }

    // Update transaction status
    transaction.status = 'completed';
    transaction.completedAt = new Date();
    await transaction.save();

    return res.json({
      success: true,
      message: 'Escrow completed, funds released to seller',
      transaction
    });
  } catch (error) {
    console.error('Error completing escrow:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Refund escrow to buyer
export const refundEscrow = async (req: Request<{orderId: string}, {}, RefundEscrowRequest>, res: Response): Promise<Response> => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const transaction = await EscrowTransaction.findOne({ orderId });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'paid') {
      return res.status(400).json({ error: 'Transaction not in paid status' });
    }

    if (!transaction.vnpayTransactionNo) {
      return res.status(400).json({ error: 'No VNPay transaction number found' });
    }

    // Process refund with VNPay
    const refundResult = await vnpay.refund({
      vnp_Amount: transaction.amount,
      vnp_CreateBy: 'escrow-system',
      vnp_IpAddr: req.ip || '127.0.0.1',
      vnp_OrderInfo: reason || `Refund for escrow order ${orderId}`,
      vnp_RequestId: `REFUND-${Date.now()}`,
      vnp_TransactionDate: dateFormat(transaction.paidAt || new Date()),
      vnp_TransactionNo: Number(transaction.vnpayTransactionNo),
      vnp_TransactionType: RefundTransactionType.FULL_REFUND,
      vnp_TxnRef: orderId,
      vnp_CreateDate: dateFormat(new Date()),
    });

    if (refundResult.isSuccess) {
      // Update transaction status
      transaction.status = 'refunded';
      transaction.refundedAt = new Date();
      await transaction.save();

      return res.json({
        success: true,
        message: 'Escrow refunded to buyer',
        transaction,
        refundResult
      });
    } else {
      return res.status(400).json({
        error: 'Refund failed',
        refundResult
      });
    }
  } catch (error) {
    console.error('Error processing refund:', error);
    return res.status(500).json({ error: 'Failed to process refund' });
  }
};

// VNPay IPN endpoint
export const vnpayIpn = (req: Request, res: Response): any => {
  try {
    // Type cast request query to match VNPay's expected format
    const queryParams = req.query as unknown as ReturnQueryFromVNPay;
    const verify = vnpay.verifyIpnCall(queryParams);

    if (!verify.isVerified) {
      res.json(IpnFailChecksum);
      return;
    }

    // Find and update transaction
    EscrowTransaction.findOne({ orderId: verify.vnp_TxnRef })
      .then((transaction: IEscrowTransaction | null) => {
        if (!transaction) {
          return res.json(IpnOrderNotFound);
        }

        if (verify.vnp_Amount !== transaction.amount) {
          return res.json(IpnInvalidAmount);
        }

        if (transaction.status !== 'pending') {
          return res.json(InpOrderAlreadyConfirmed);
        }

        // Update transaction status
        transaction.status = 'paid';
        transaction.paidAt = new Date();
        transaction.vnpayTransactionNo = String(verify.vnp_TransactionNo);

        return transaction.save().then(() => {
          console.log(`Escrow payment confirmed for order ${verify.vnp_TxnRef}`);
          return res.json(IpnSuccess);
        });
      })
      .catch((err: Error) => {
        console.error('Error processing IPN:', err);
        return res.json(IpnUnknownError);
      });
  } catch (error) {
    console.error('IPN error:', error);
    return res.json(IpnUnknownError);
  }
};

// VNPay return URL endpoint
export const vnpayReturn = async (req: Request, res: Response): Promise<void> => {
  try {
    // Type cast request query to match VNPay's expected format
    const queryParams = req.query as unknown as ReturnQueryFromVNPay;
    const verify = vnpay.verifyReturnUrl(queryParams);

    if (!verify.isVerified) {
      const html = renderTemplate('error.html', {
        title: 'Lỗi Xác Thực',
        statusColor: '#dc3545',
        statusIcon: '❌',
        statusTitle: 'Xác Thực Thất Bại',
        statusMessage: 'Không thể xác thực giao dịch của bạn. Vui lòng thử lại.',
        showDetails: false,
        showOrderDetails: false
      });
      res.status(400).send(html);
      return;
    }

    const transaction = await EscrowTransaction.findOne({ orderId: verify.vnp_TxnRef });

    if (!transaction) {
      const html = renderTemplate('error.html', {
        title: 'Không Tìm Thấy Giao Dịch',
        statusColor: '#ffc107',
        statusIcon: '⚠️',
        statusTitle: 'Không Tìm Thấy Giao Dịch',
        statusMessage: 'Giao dịch không tồn tại trong hệ thống.',
        showDetails: false,
        showOrderDetails: false
      });
      res.status(404).send(html);
      return;
    }

    // Update transaction status if payment is successful and still pending
    if (verify.isSuccess && transaction.status === 'pending') {
      transaction.status = 'paid';
      transaction.paidAt = new Date();
      transaction.vnpayTransactionNo = String(verify.vnp_TransactionNo);
      await transaction.save();
      console.log(`Payment confirmed via return URL for order ${verify.vnp_TxnRef}`);
    }

    // Render success or failure page
    const isSuccess = verify.isSuccess ?? false;
    const templateData = {
      title: isSuccess ? 'Thanh Toán Thành Công!' : 'Thanh Toán Thất Bại',
      statusColor: isSuccess ? '#28a745' : '#dc3545',
      statusIcon: isSuccess ? '✅' : '❌',
      statusTitle: isSuccess ? 'Thanh Toán Thành Công!' : 'Thanh Toán Thất Bại',
      statusMessage: isSuccess
        ? 'Giao dịch của bạn đã được xử lý thành công.'
        : 'Giao dịch không thành công. Vui lòng thử lại.',
      showDetails: true,
      orderId: transaction.orderId,
      amount: transaction.amount.toLocaleString('vi-VN'),
      status: transaction.status.toUpperCase(),
      timestamp: new Date().toLocaleString('vi-VN'),
      bankCode: verify.vnp_BankCode || '',
      transactionNo: verify.vnp_TransactionNo || '',
      showOrderDetails: true
    };

    const html = renderTemplate('success.html', templateData);
    res.send(html);
  } catch (error) {
    console.error('Return URL error:', error);
    const html = renderTemplate('error.html', {
      title: 'Lỗi Hệ Thống',
      statusColor: '#dc3545',
      statusIcon: '⚠️',
      statusTitle: 'Lỗi Hệ Thống',
      statusMessage: 'Đã xảy ra lỗi khi xử lý giao dịch. Vui lòng thử lại sau.',
      showDetails: false,
      showOrderDetails: false
    });
    res.status(500).send(html);
  }
};

// Helper function to render HTML templates
function renderTemplate(templateName: string, data: Record<string, any>): string {
  const templatePath = path.join(__dirname, '..', 'templates', templateName);
  let template = fs.readFileSync(templatePath, 'utf-8');

  // Replace template variables
  Object.keys(data).forEach(key => {
    const value = data[key];
    // Handle conditional blocks
    const conditionalRegex = new RegExp(`{{#${key}}}([\\s\\S]*?){{\\/${key}}}`, 'g');
    if (value) {
      template = template.replace(conditionalRegex, '$1');
    } else {
      template = template.replace(conditionalRegex, '');
    }
    // Replace simple variables
    const variableRegex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(variableRegex, String(value || ''));
  });

  // Remove any remaining template variables
  template = template.replace(/{{[^}]+}}/g, '');

  return template;
}
