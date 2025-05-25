import { Request, Response, NextFunction } from 'express';
import mongoose, { mongo } from 'mongoose';
import EscrowTransaction, { IEscrowTransaction } from '../models/EscrowTransaction.js'

interface GetAllTransactionsQuery {
    page?: string;
    limit?: string;
    sortBy?: keyof IEscrowTransaction | string; // Cho phép sắp xếp theo các trường của IEscrowTransaction hoặc string chung
    sortOrder?: 'asc' | 'desc';
    status?: IEscrowTransaction['status'];
    orderId?: string;
    buyerId?: string;
    sellerId?: string;
    minAmount?: string;
    maxAmount?: string;
    startDate?: string; // ISO Date string
    endDate?: string;   // ISO Date string
}

// Interface for response
interface GetAllTransactionsResponse {
    success: boolean;
    data?: {
        transactions: IEscrowTransaction[];
        currentPage: number;
        totalPages: number;
        totalTransactions: number;
        limit: number;
    };
    msg?: string;
}


export const getAllTransactions = async (
    req: Request<{}, {}, {}, GetAllTransactionsQuery>, // Req body trống, Res body mặc định, Params trống, Query có kiểu
    res: Response<GetAllTransactionsResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const {
            page = '1',
            limit = '10',
            sortBy = 'createdAt',
            sortOrder = 'desc',
            status,
            orderId,
            buyerId,
            sellerId,
            minAmount,
            maxAmount,
            startDate,
            endDate,
        } = req.query;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const filter: mongoose.FilterQuery<IEscrowTransaction> = {};

        if (status) {
            filter.status = status;
        }
        if (orderId) {
            filter.orderId = { $regex: orderId, $options: 'i' }; // find with case-insensitive regex
        }
        if (buyerId) {
            // Kiểm tra nếu buyerId là một ObjectId hợp lệ (nếu buyerId của bạn là ObjectId)
            // if (mongoose.Types.ObjectId.isValid(buyerId)) {
            //   filter.buyerId = buyerId;
            // } else {
            // Xử lý trường hợp buyerId không hợp lệ, ví dụ: trả về mảng rỗng hoặc lỗi
            // }
            filter.buyerId = buyerId; // Giả sử buyerId là string
        }
        if (sellerId) {
            filter.sellerId = sellerId;
        }
        if (minAmount || maxAmount) {
            filter.amount = {};
            if (minAmount) {
                filter.amount.$gte = parseFloat(minAmount);
            }
            if (maxAmount) {
                filter.amount.$lte = parseFloat(maxAmount);
            }
        }
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                // Thêm một ngày để bao gồm toàn bộ ngày kết thúc
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = endOfDay;
            }
        }

        // Build sort object
        const sort: { [key: string]: mongoose.SortOrder } = {};
        if (sortBy) {
            sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
        }

        const totalTransactions = await EscrowTransaction.countDocuments(filter);
        const transactions = await EscrowTransaction.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .lean(); // .lean() để trả về plain JavaScript objects, nhanh hơn
        res.json({
            success: true,
            data: {
                transactions,
                currentPage: pageNum,
                totalPages: Math.ceil(totalTransactions / limitNum),
                totalTransactions,
                limit: limitNum,
            },
        });
    } catch (error: any) {
        console.error('Error fetching all transactions:', error);
        // next(error); // Cho middleware xử lý lỗi
        res.status(500).json({ success: false, msg: error.message || 'Server Error when fetching transactions' });
    }
};