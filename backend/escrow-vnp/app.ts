import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
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

const app = express();
const port = 3000;

// Initialize VNPay instance
const vnpay = new VNPay({
    tmnCode: 'O59QWU4L',
    secureSecret: '45CRNASA91ZY51HKEFY0FE9K8X0FZZVL',
    vnpayHost: 'https://sandbox.vnpayment.vn',
    testMode: true,
    hashAlgorithm: HashAlgorithm.SHA512,
    enableLog: true,
    vnp_Locale: VnpLocale.VN,
    endpoints: {
        paymentEndpoint: 'paymentv2/vpcpay.html',
        queryDrRefundEndpoint: 'merchant_webapi/api/transaction',
        getBankListEndpoint: 'qrpayauth/api/merchant/get_bank_list',
    },
});

// In-memory storage for escrow transactions (use a real database in production)
interface EscrowTransaction {
    orderId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    status: 'pending' | 'paid' | 'completed' | 'refunded' | 'cancelled';
    vnpayTransactionNo?: string;
    createdAt: Date;
    paidAt?: Date;
    completedAt?: Date;
    refundedAt?: Date;
}

const escrowTransactions: Map<string, EscrowTransaction> = new Map();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    return res.json({
        message: 'VNPay Escrow Payment App',
        endpoints: {
            'POST /escrow/create': 'Create a new escrow transaction',
            'GET /escrow/:orderId': 'Get escrow transaction details',
            'POST /escrow/:orderId/complete': 'Complete escrow and release funds to seller',
            'POST /escrow/:orderId/refund': 'Refund escrow to buyer',
            'GET /vnpay-ipn': 'VNPay IPN callback',
            'GET /vnpay-return': 'VNPay return callback',
        },
    });
});

// Create a new escrow transaction
app.post('/escrow/create', async (req: Request, res: Response) => {
    try {
        const { buyerId, sellerId, amount, description } = req.body;

        if (!buyerId || !sellerId || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const orderId = uuidv4().replaceAll('-', '');
        const escrowTransaction: EscrowTransaction = {
            orderId,
            buyerId,
            sellerId,
            amount,
            status: 'pending',
            createdAt: new Date(),
        };

        escrowTransactions.set(orderId, escrowTransaction);

        // Create payment URL
        const paymentUrl = vnpay.buildPaymentUrl({
            vnp_Amount: amount,
            vnp_IpAddr: '1.1.1.1',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: description || `Escrow payment for order ${orderId}`,
            vnp_OrderType: ProductCode.Other,
            vnp_ReturnUrl: `http://localhost:${port}/vnpay-return`,
        });

        return res.json({
            success: true,
            orderId,
            paymentUrl,
            escrowTransaction,
        });
    } catch (error) {
        console.error('Error creating escrow:', error);
        return res.status(500).json({ error: 'Failed to create escrow transaction' });
    }
});

// Get escrow transaction details
app.get('/escrow/:orderId', async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const transaction = escrowTransactions.get(orderId);

    if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
    }

    // Query VNPay for latest transaction status if paid
    if (transaction.vnpayTransactionNo && transaction.status === 'paid') {
        try {
            const queryResult = await vnpay.queryDr({
                vnp_CreateDate: dateFormat(transaction.createdAt),
                vnp_IpAddr: '127.0.0.1',
                vnp_OrderInfo: `Escrow payment for order ${orderId}`,
                vnp_RequestId: `QUERY-${Date.now()}`,
                vnp_TransactionDate: dateFormat(transaction.paidAt || new Date()),
                vnp_TransactionNo: Number(transaction.vnpayTransactionNo),
                vnp_TxnRef: orderId,
            });

            return res.json({
                transaction,
                vnpayStatus: queryResult,
            });
        } catch (error) {
            console.error('Error querying VNPay:', error);
        }
    }

    return res.json({ transaction });
});

// Complete escrow and release funds to seller
app.post('/escrow/:orderId/complete', async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const transaction = escrowTransactions.get(orderId);

    if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'paid') {
        return res.status(400).json({ error: 'Transaction not in paid status' });
    }

    // In a real system, you would transfer funds to the seller here
    // For this example, we'll just update the status
    transaction.status = 'completed';
    transaction.completedAt = new Date();

    return res.json({
        success: true,
        message: 'Escrow completed, funds released to seller',
        transaction,
    });
});

// Refund escrow to buyer
app.post('/escrow/:orderId/refund', async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { reason } = req.body;
    const transaction = escrowTransactions.get(orderId);

    if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'paid') {
        return res.status(400).json({ error: 'Transaction not in paid status' });
    }

    if (!transaction.vnpayTransactionNo) {
        return res.status(400).json({ error: 'No VNPay transaction number found' });
    }

    try {
        const refundResult = await vnpay.refund({
            vnp_Amount: transaction.amount,
            vnp_CreateBy: 'escrow-system',
            vnp_IpAddr: '127.0.0.1',
            vnp_OrderInfo: reason || `Refund for escrow order ${orderId}`,
            vnp_RequestId: `REFUND-${Date.now()}`,
            vnp_TransactionDate: dateFormat(transaction.paidAt || new Date()),
            vnp_TransactionNo: Number(transaction.vnpayTransactionNo),
            vnp_TransactionType: RefundTransactionType.FULL_REFUND,
            vnp_TxnRef: orderId,
            vnp_CreateDate: dateFormat(new Date()),
        });

        if (refundResult.isSuccess) {
            transaction.status = 'refunded';
            transaction.refundedAt = new Date();

            return res.json({
                success: true,
                message: 'Escrow refunded to buyer',
                transaction,
                refundResult,
            });
        } else {
            return res.status(400).json({
                error: 'Refund failed',
                refundResult,
            });
        }
    } catch (error) {
        console.error('Error processing refund:', error);
        return res.status(500).json({ error: 'Failed to process refund' });
    }
});

// VNPay IPN endpoint
app.get(
    '/vnpay-ipn',
    (req: Request<unknown, unknown, unknown, ReturnQueryFromVNPay>, res: Response<IpnResponse>) => {
        try {
            const verify: VerifyReturnUrl = vnpay.verifyIpnCall(req.query);

            if (!verify.isVerified) {
                return res.json(IpnFailChecksum);
            }

            const transaction = escrowTransactions.get(verify.vnp_TxnRef);

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

            console.log(`Escrow payment confirmed for order ${verify.vnp_TxnRef}`);

            return res.json(IpnSuccess);
        } catch (error) {
            console.error('IPN error:', error);
            return res.json(IpnUnknownError);
        }
    }
);

// VNPay return URL endpoint
app.get(
    '/vnpay-return',
    (req: Request<unknown, unknown, unknown, ReturnQueryFromVNPay>, res: Response) => {
        try {
            const verify: VerifyReturnUrl = vnpay.verifyReturnUrl(req.query);

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
                return res.status(400).send(html);
            }

            const transaction = escrowTransactions.get(verify.vnp_TxnRef);

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
                return res.status(404).send(html);
            }

            // Update transaction status if payment is successful and still pending
            if (verify.isSuccess && transaction.status === 'pending') {
                transaction.status = 'paid';
                transaction.paidAt = new Date();
                transaction.vnpayTransactionNo = String(verify.vnp_TransactionNo);
                console.log(`Payment confirmed via return URL for order ${verify.vnp_TxnRef}`);
            }

            // Render success or failure page
            const isSuccess = verify.isSuccess;
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
            return res.send(html);
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
            return res.status(500).send(html);
        }
    }
);

// Helper function to render HTML templates
function renderTemplate(templateName: string, data: Record<string, any>): string {
    const templatePath = path.join(__dirname, 'templates', templateName);
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
        template = template.replace(variableRegex, value || '');
    });

    // Remove any remaining template variables
    template = template.replace(/{{[^}]+}}/g, '');

    return template;
}

// Start server
app.listen(port, () => {
    console.log(`VNPay Escrow Payment App running at http://localhost:${port}`);
    console.log('\nAvailable endpoints:');
    console.log('- POST /escrow/create - Create new escrow transaction');
    console.log('- GET /escrow/:orderId - Get transaction details');
    console.log('- POST /escrow/:orderId/complete - Complete escrow');
    console.log('- POST /escrow/:orderId/refund - Refund escrow');
});
