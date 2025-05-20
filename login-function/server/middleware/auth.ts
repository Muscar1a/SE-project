import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define interfaces for JWT payload and extended Request
interface IUserPayload {
  user: {
    id: string;
    isTwoFactorEnabled?: boolean;
    [key: string]: any;
  };
  twoFactorVerified?: boolean;
}

interface IAuthRequest extends Request {
  user?: IUserPayload['user'];
}

// Default export for basic auth middleware
export default function(req: IAuthRequest, res: Response, next: NextFunction): void {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    res.status(401).json({ msg: 'No token, authorization denied' });
    return;
  }

  // Verify token
  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT Secret is not defined in environment variables');
    }

    const decoded = jwt.verify(token, jwtSecret) as IUserPayload;
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}

// Named export for 2FA middleware
export function require2FA(req: IAuthRequest, res: Response, next: NextFunction): void {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    res.status(401).json({ msg: 'No token, authorization denied' });
    return;
  }

  // Verify token
  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT Secret is not defined in environment variables');
    }

    const decoded = jwt.verify(token, jwtSecret) as IUserPayload;

    // Check if 2FA was completed
    if (!decoded.twoFactorVerified && decoded.user.isTwoFactorEnabled) {
      res.status(401).json({ msg: '2FA required', require2FA: true });
      return;
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}
