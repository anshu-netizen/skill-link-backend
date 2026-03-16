import type { Request, Response } from 'express';
import { Skill } from '../models/Skill.js';

// @desc    Get ONLY the logged-in provider's skills
export const getMySkills = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id; 
    // Find skills where the provider field matches the ID from the token
    const skills = await Skill.find({ provider: userId }).sort({ createdAt: -1 });
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your skills" });
  }
};

// @desc    Create a new skill (Auto-links to logged-in User)
export const createSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, category, price, availability } = req.body;
    
    // We get the provider ID strictly from the auth middleware (req.user)
    const providerId = (req as any).user._id;

    if (!title || !price || !category) {
      res.status(400).json({ message: "Please provide all required fields" });
      return;
    }

    const newSkill = await Skill.create({
      provider: providerId, // This links it to Anshu Dalal's ID
      title,
      description,
      category,
      price,
      availability: availability || "Available"
    });

    res.status(201).json(newSkill);
  } catch (error) {
    res.status(400).json({ message: "Failed to create skill. Check data types." });
  }
};

// @desc    Other standard controllers
export const getSkills = async (req: Request, res: Response) => {
  const skills = await Skill.find().populate('provider', 'name email');
  res.status(200).json(skills);
};

export const getSkillById = async (req: Request, res: Response) => {
  try {
    const skill = await Skill.findById(req.params.id).populate('provider', 'name email');
    if (!skill) return res.status(404).json({ message: "Not found" });
    res.status(200).json(skill);
  } catch (error) {
    res.status(400).json({ message: "Invalid ID" });
  }
};