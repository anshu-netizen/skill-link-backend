import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  let token;

  // 1. Check if the header exists and starts with Bearer
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      // 2. Extract the token
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token using your JWT_SECRET
      const decoded = jwt.verify(token!, process.env.JWT_SECRET!) as { id: string };
      
      /**
       * CRITICAL FIX: 
       * We attach an object containing _id. 
       * This allows controllers to use req.user._id consistently.
       */
      (req as any).user = { _id: decoded.id };
      
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // 4. If no token was found at all
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};