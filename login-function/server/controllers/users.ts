import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
  username?: string; // Add username as an optional field
}

// Register a user
export const registerUser = async (req: Request<{}, {}, RegisterUserRequest>, res: Response): Promise<Response> => {
  const { name, email, password, username } = req.body;

  try {
    // See if user exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create a new user - handle both explicit name or username field
    user = new User({
      name: name || username || email.split('@')[0], // fallback to username or derive from email if name not provided
      email,
      password
    });

    // Log the user object for debugging
    console.log('Creating new user:', {
      name: user.name,
      email: user.email,
      // Don't log password for security reasons
    });

    await user.save();

    // Create token payload
    const payload = {
      user: {
        id: user.id,
        isTwoFactorEnabled: false
      },
      twoFactorVerified: true
    };

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({ msg: 'Server configuration error' });
    }

    // Sign token
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '5h' });

    return res.json({ token });
  } catch (err) {
    console.error('User registration error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};
