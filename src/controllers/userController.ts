import type { Request, Response } from 'express';
import { User } from '../models/User.js';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      count: users.length,
      users
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};