import express, { Request, Response } from 'express';
import auth, { require2FA } from '../middleware/auth.js';
import {
  login,
  getUser,
  enable2FA,
  verify2FASetup,
  verify2FA,
  disable2FA
} from '../controllers/auth.js';

const router = express.Router();

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
router.get('/', auth, getUser);

// @route   POST api/auth/enable-2fa
// @desc    Initialize 2FA setup
// @access  Private
router.post('/enable-2fa', auth, enable2FA);

// @route   POST api/auth/verify-2fa-setup
// @desc    Verify and complete 2FA setup
// @access  Private
router.post('/verify-2fa-setup', auth, verify2FASetup);

// @route   POST api/auth/verify-2fa
// @desc    Verify 2FA during login
// @access  Public
router.post('/verify-2fa', verify2FA);

// @route   POST api/auth/disable-2fa
// @desc    Disable 2FA
// @access  Private
router.post('/disable-2fa', require2FA, disable2FA);

// @route   GET api/auth/protected
// @desc    Test protected route that requires 2FA
// @access  Private + 2FA
router.get('/protected', require2FA, (req: Request, res: Response) => {
  res.json({ msg: 'Hello from protected route!' });
});

export default router;
