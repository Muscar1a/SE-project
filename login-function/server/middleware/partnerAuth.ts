import { Request, Response, NextFunction } from 'express';
import Partner, { IPartner } from '../models/Partner.js';

interface IPartnerRequest extends Request {
  partner?: IPartner;
}

export default async function partnerAuth(
  req: IPartnerRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Get token from header
  const token = req.header('X-Partner-Token') || req.header('x-partner-token');

  // Check if no token
  if (!token) {
    res.status(401).json({
      success: false,
      error: 'No partner token provided'
    });
    return;
  }

  try {
    // Find partner by secret token
    const partner = await Partner.findOne({
      secretToken: token,
      isActive: true
    });

    if (!partner) {
      res.status(401).json({
        success: false,
        error: 'Invalid partner token'
      });
      return;
    }

    // Update last used timestamp
    partner.lastUsed = new Date();
    await partner.save();

    // Add partner to request object
    req.partner = partner;
    next();
  } catch (err) {
    console.error('Partner auth error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error during authentication'
    });
  }
}
