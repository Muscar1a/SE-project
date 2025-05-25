import { Request, Response, NextFunction } from 'express';
import EscrowTransaction from '../models/EscrowTransaction.js';
import User from '../models/User.js';

interface DashboardStatsData {
    transactions: {
        total: number;
        pending: number;
        paid: number;
        completed: number;
        refunded: number;
        cancelled: number;
        // disputed: number; // From dispute queue
    };
    volume: {
        totalProcessedAmount: number;
    };
    users: {
        total: number;
        newInLast24h: number;
        // flagged?: number; // Ví dụ
    };
    // alerts?: { // Ví dụ
    //   [key: string]: number;
    // };
    // partners?: {
    //   total: number;
    //   active: number;
    // };
}

interface DashboardStatsResponse {
    success: boolean;
    data?: DashboardStatsData;
    msg?: string;
}

export const getDashboardStats = async (
    req: Request,
    res: Response<DashboardStatsResponse>, // Sử dụng kiểu Response đã định nghĩa
    next: NextFunction
): Promise<void> => {
    try {
        // --- Transaction Stats ---
        const totalTransactions: number = await EscrowTransaction.countDocuments();
        const pendingTransactions: number = await EscrowTransaction.countDocuments({ status: 'pending' });
        const paidTransactions: number = await EscrowTransaction.countDocuments({ status: 'paid' });
        const completedTransactions: number = await EscrowTransaction.countDocuments({ status: 'completed' });
        const refundedTransactions: number = await EscrowTransaction.countDocuments({ status: 'refunded' });
        const cancelledTransactions: number = await EscrowTransaction.countDocuments({ status: 'cancelled' });


        // const disputeTransactions = await EscrowTransaction.countDocuments({ status: 'disputed' });
        // ? not sure about this

        const totalVolumeResult: { _id: null; totalAmount: number }[] = await EscrowTransaction.aggregate([
            {
                $match: { status: { $in: ['paid', 'completed'] } }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);
        const totalTransactionVolume: number = totalVolumeResult.length > 0 ? totalVolumeResult[0].totalAmount : 0;


        // --- User Statistics ---
        const totalUsers: number = await User.countDocuments();

        const twentyFourHoursAgo: Date = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newUsersToday: number = await User.countDocuments({ createdAt: { $gte: twentyFourHoursAgo } });


        // --- Alert Stats (Ví dụ) ---
        // const flaggedUsersCount: number = await User.countDocuments({ isFlagged: true } as FilterQuery<IUser>); // Cần định nghĩa isFlagged trong IUser

        // --- Partner Stats (Ví dụ) ---
        // const totalPartners: number = await Partner.countDocuments();
        // const activePartners: number = await Partner.countDocuments({ isActive: true });

        const responseData: DashboardStatsData = {
            transactions: {
                total: totalTransactions,
                pending: pendingTransactions,
                paid: paidTransactions,
                completed: completedTransactions,
                refunded: refundedTransactions,
                cancelled: cancelledTransactions,
                // disputed: disputedTransactions,
            },
            volume: {
                totalProcessedAmount: totalTransactionVolume,
            },
            users: {
                total: totalUsers,
                newInLast24h: newUsersToday,
                // flagged: flaggedUsersCount,
            },
            // partners: {
            //   total: totalPartners,
            //   active: activePartners,
            // }
        };

        res.json({
            success: true,
            data: responseData
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, msg: 'Server Error when fetching dashboard stats' });
    }

}