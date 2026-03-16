import type { Request, Response } from 'express';
import { Skill } from '../models/Skill.js';

// @desc    Get all skills (Public)
export const getSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    const skills = await Skill.find().populate('provider', 'name email');
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ message: "Error fetching skills" });
  }
};

// @desc    Create a new skill (Private - Provider only)
export const createSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, category, price } = req.body;
    
    // 'req.user' is attached by our auth middleware
    const newSkill = await Skill.create({
      provider: (req as any).user, 
      title,
      description,
      category,
      price
    });

    res.status(201).json(newSkill);
  } catch (error) {
    res.status(400).json({ message: "Error creating skill" });
  }
};

// @desc    Get single skill by ID (Public)
export const getSkillById = async (req: Request, res: Response): Promise<void> => {
  try {
    const skill = await Skill.findById(req.params.id).populate('provider', 'name email');
    
    if (!skill) {
      res.status(404).json({ message: "Skill not found" });
      return;
    }

    res.status(200).json(skill);
  } catch (error) {
    // This handles invalid MongoDB ObjectIDs
    res.status(400).json({ message: "Invalid Skill ID" });
  }
};

// @desc    Get ONLY the logged-in provider's skills (Private - Provider Dashboard)
export const getMySkills = async (req: Request, res: Response): Promise<void> => {
  try {
    // We filter by the provider ID stored in the token (attached by auth middleware)
    const providerId = (req as any).user._id; 
    
    const skills = await Skill.find({ provider: providerId }).populate('provider', 'name email');
    
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your skills" });
  }
};