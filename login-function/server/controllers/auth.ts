import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import User, { IUser } from '../models/User.js';

// Define interfaces
interface TokenPayload {
  user: {
    id: string;
    isTwoFactorEnabled: boolean;
  };
  twoFactorVerified?: boolean;
}

interface IAuthRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

// Authenticate user & get token
export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create token payload
    const payload: TokenPayload = {
      user: {
        id: user.id,
        isTwoFactorEnabled: user.isTwoFactorEnabled
      }
    };

    // If 2FA is not enabled, provide full access token
    if (!user.isTwoFactorEnabled) {
      payload.twoFactorVerified = true;
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({ msg: 'Server configuration error' });
    }

    // Sign token
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '5h' });

    return res.json({
      token,
      require2FA: user.isTwoFactorEnabled && !payload.twoFactorVerified
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Get logged in user
export const getUser = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const user = await User.findById(req.user.id).select('-password -twoFactorSecret');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Initialize 2FA setup
export const enable2FA = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Generate new secret
    const secret = authenticator.generateSecret();

    // Save temporary secret
    user.twoFactorSecret = secret;
    await user.save();

    // Generate QR code
    const appName = 'MERN Auth';
    const otpauthUrl = authenticator.keyuri(user.email, appName, secret);
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    return res.json({
      secret,
      qrCode
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Verify and complete 2FA setup
export const verify2FASetup = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    const { token } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const user = await User.findById(req.user.id);

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ msg: '2FA setup not initiated' });
    }

    // Verify token
    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret
    });

    if (!isValid) {
      return res.status(400).json({ msg: 'Invalid verification code' });
    }

    // Enable 2FA
    user.isTwoFactorEnabled = true;
    await user.save();

    return res.json({ msg: '2FA has been enabled' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Verify 2FA during login
export const verify2FA = async (req: Request, res: Response): Promise<Response> => {
  const { token, userId } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ msg: 'Invalid request' });
    }

    // Verify token
    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret
    });

    if (!isValid) {
      return res.status(400).json({ msg: 'Invalid verification code' });
    }

    // Create token with 2FA verification
    const payload: TokenPayload = {
      user: {
        id: user.id,
        isTwoFactorEnabled: true
      },
      twoFactorVerified: true
    };

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({ msg: 'Server configuration error' });
    }

    // Sign token
    const newToken = jwt.sign(payload, jwtSecret, { expiresIn: '5h' });

    return res.json({ token: newToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Disable 2FA
export const disable2FA = async (req: IAuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Disable 2FA
    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    return res.json({ msg: '2FA has been disabled' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};
