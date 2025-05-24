import express from 'express';
import auth, { require2FA } from '../middleware/auth.js';
import {
  createPartner,
  getAllPartners,
  getPartnerDetails,
  regeneratePartnerToken,
  togglePartnerStatus,
  deletePartner
} from '../controllers/admin.js';

const router = express.Router();

// All admin routes require authentication (and 2FA if enabled)
// In a production environment, you might want additional admin role checking

// @route   POST api/admin/partners
// @desc    Create new partner
// @access  Private (Admin)
router.post('/partners', auth, createPartner);

// @route   GET api/admin/partners
// @desc    Get all partners
// @access  Private (Admin)
router.get('/partners', auth, getAllPartners);

// @route   GET api/admin/partners/:partnerId
// @desc    Get partner details including secret token
// @access  Private (Admin)
router.get('/partners/:partnerId', auth, getPartnerDetails);

// @route   POST api/admin/partners/:partnerId/regenerate-token
// @desc    Regenerate partner secret token
// @access  Private (Admin)
router.post('/partners/:partnerId/regenerate-token', auth, regeneratePartnerToken);

// @route   PUT api/admin/partners/:partnerId/toggle-status
// @desc    Toggle partner active status
// @access  Private (Admin)
router.put('/partners/:partnerId/toggle-status', auth, togglePartnerStatus);

// @route   DELETE api/admin/partners/:partnerId
// @desc    Delete partner (only if no transactions)
// @access  Private (Admin)
router.delete('/partners/:partnerId', auth, deletePartner);



// --- ADMIN PANEL ROUTES (không có requireAdmin) ---

// --- I. Dashboard ---
// @route   GET api/admin/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Admin - hiện tại được bảo vệ bởi auth & 2FA)
router.get('/dashboard/stats', auth, require2FA, getDashboardStats);

// Ví dụ cho alerts và dispute queue (nếu bạn triển khai riêng)
// router.get('/dashboard/alerts', auth, require2FA, getDashboardAlerts);
// router.get('/dashboard/dispute-queue', auth, require2FA, getDisputeQueue);

// --- II. Transactions Management ---
// @route   GET api/admin/transactions
// @desc    Get all transactions (with filtering, pagination)
// @access  Private (Admin - hiện tại được bảo vệ bởi auth & 2FA)
router.get('/transactions', auth, require2FA, getAllTransactions);

// @route   GET api/admin/transactions/:transactionId
// @desc    Get transaction details
// @access  Private (Admin - hiện tại được bảo vệ bởi auth & 2FA)
router.get('/transactions/:transactionId', auth, require2FA, getTransactionDetails);

// @route   POST api/admin/transactions/:transactionId/force-release
// @desc    Manually force release funds for a transaction
// @access  Private (Admin - hiện tại được bảo vệ bởi auth & 2FA)
router.post('/transactions/:transactionId/force-release', auth, require2FA, forceReleaseTransaction);

// @route   POST api/admin/transactions/:transactionId/force-refund
// @desc    Manually force refund for a transaction
// @access  Private (Admin - hiện tại được bảo vệ bởi auth & 2FA)
router.post('/transactions/:transactionId/force-refund', auth, require2FA, forceRefundTransaction);

// --- III. User Accounts Management (Nếu bạn quyết định giữ lại phần này) ---
// Nếu bạn không cần quản lý user cuối, có thể bỏ các route này
// @route   GET api/admin/users
// @desc    Get all users (with filtering, pagination)
// @access  Private (Admin - hiện tại được bảo vệ bởi auth & 2FA)
// router.get('/users', auth, require2FA, getAllUsers);

// @route   GET api/admin/users/:userId
// @desc    Get user details
// @access  Private (Admin - hiện tại được bảo vệ bởi auth & 2FA)
// router.get('/users/:userId', auth, require2FA, getUserDetails);

// @route   PUT api/admin/users/:userId/status
// @desc    Update user status (activate, deactivate, ban)
// @access  Private (Admin - hiện tại được bảo vệ bởi auth & 2FA)
// router.put('/users/:userId/status', auth, require2FA, updateUserStatus);

// @route   POST api/admin/users/:userId/flag
// @desc    Flag a user for suspicious behavior
// @access  Private (Admin - hiện tại được bảo vệ bởi auth & 2FA)
// router.post('/users/:userId/flag', auth, require2FA, flagUser);

// @route   DELETE api/admin/users/:userId/flag
// @desc    Unflag a user
// @access  Private (Admin - hiện tại được bảo vệ bởi auth & 2FA)
// router.delete('/users/:userId/flag', auth, require2FA, unflagUser);

// --- IV. Audit Logs ---
// @route   GET api/admin/audit-logs
// @desc    Get audit logs (with filtering, pagination)
// @access  Private (Admin - hiện tại được bảo vệ bởi auth & 2FA)
router.get('/audit-logs', auth, require2FA, getAuditLogs);

// @route   GET api/admin/audit-logs/export
// @desc    Export audit logs
// @access  Private (Admin - hiện tại được bảo vệ bởi auth & 2FA)
router.get('/audit-logs/export', auth, require2FA, exportAuditLogs);

// --- V. System Settings ---
// @route   GET api/admin/settings
// @desc    Get all system settings
// @access  Private (Admin - hiện tại được bảo vệ bởi auth & 2FA)
router.get('/settings', auth, require2FA, getSystemSettings);

// @route   PUT api/admin/settings
// @desc    Update system settings
// @access  Private (Admin - hiện tại được bảo vệ bởi auth & 2FA)
router.put('/settings', auth, require2FA, updateSystemSettings);



export default router;
