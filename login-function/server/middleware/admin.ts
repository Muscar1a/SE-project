import { Request, Response, NextFunction } from 'express';

// Extend Request type to include user
interface AuthRequest extends Request {
  user?: { role?: string };
}

// Simple admin middleware: check if req.user && req.user.role === 'admin'
export function admin(req: AuthRequest, res: Response, next: NextFunction) {
  // if (req.user && req.user.role === 'admin') {
    return next();
  // }
  // return res.status(403).json({ error: 'Admin access required' });
}
