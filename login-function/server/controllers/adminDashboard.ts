import { Request, Response, NextFunction } from 'express';
import EscrowTransaction from '../models/EscrowTransaction.js';
import User from '../models/User.js';


export const getDashboardStats = async (req, res, next) => {
    try {
        // --- Transaction Statistics ---
        const totalTransactions = await EscrowTransaction.countDocuments();
        const pendingTransactions = await EscrowTransaction.countDocuments({ status: 'pending' });
        const paidTransactions = await EscrowTransaction.countDocuments({ status: 'paid' }); // paid, but not done
        const completedTransactions = await EscrowTransaction.countDocuments({ status: 'completed' });
        const refundedTransactions = await EscrowTransaction.countDocuments({ status: 'refunded' });
        const cancledTransactions = await EscrowTransaction.countDocuments({ status: 'cancelled' });

        // const disputeTransactions = await EscrowTransaction.countDocuments({ status: 'disputed' });
        // ? not sure about this

        const totalVolumeResult = await EscrowTransaction.aggregate([])

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, msg: 'Server Error when fetching dashboard stats' });
    }

}