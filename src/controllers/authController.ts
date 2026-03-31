import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// =======================
// SIGNUP
// =======================
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      role,

      // Optional fields
      phone,
      bio,
      skills,
      address,
      company
    } = req.body;

    // 1. Basic validation
    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email and password are required" });
      return;
    }

    // 2. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Build user object dynamically
    const userData: any = {
      name,
      email,
      password: hashedPassword,
      role: role || 'seeker',
    };

    // Optional fields
    if (phone) userData.phone = phone;
    if (bio) userData.bio = bio;
    if (skills) userData.skills = skills;

    if (address) {
      userData.address = {
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        country: address.country || '',
        zipCode: address.zipCode || '',
      };
    }

    // Provider-specific fields
    if (role === 'provider' && company) {
      userData.company = {
        name: company.name || '',
        description: company.description || '',
        website: company.website || '',
        location: company.location || '',
      };
    }

    // 5. Create user
    const newUser = await User.create(userData);

    // 6. Generate JWT
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    // 7. Response
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


// =======================
// LOGIN
// =======================
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Validate
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // 3. Check if active
    if (!user.isActive) {
      res.status(403).json({ message: "Account is disabled" });
      return;
    }

    // 4. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // 5. Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    // 6. Response
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};