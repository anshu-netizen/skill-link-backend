import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';

export const isSeeker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Get the user from the DB using the ID attached by the 'protect' middleware
    const user = await User.findById((req as any).user._id);

    // 2. Check if user exists and has the 'seeker' role
    if (user && user.role === 'seeker') {
      next(); // Success! Move to the controller
    } else {
      res.status(403).json({ 
        message: "Access Denied: You are registered as a " + (user?.role || "unknown") + ". Only Seekers can book." 
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during role verification" });
  }
};