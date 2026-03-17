import type { Request, Response } from 'express';
import { Skill } from '../models/Skill.js';

// @desc    Get ONLY the logged-in provider's skills
// @access  Private (Provider Dashboard)
export const getMySkills = async (req: Request, res: Response): Promise<void> => {
  try {
    // Automatically knows who you are because of the 'protect' middleware
    const userId = (req as any).user?._id; 

    if (!userId) {
      res.status(401).json({ message: "User not identified" });
      return;
    }

    // Filters the DB: "Show me skills where provider == my ID"
    const skills = await Skill.find({ provider: userId }).sort({ createdAt: -1 });
    
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your skills" });
  }
};

// @desc    Create a new skill (Auto-links to logged-in User)
// @access  Private
export const createSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, category, price, availability } = req.body;
    
    // Automatically grabs Anshu Dalal's ID from the token
    const providerId = (req as any).user?._id;

    if (!providerId) {
      res.status(401).json({ message: "Unauthorized: Missing user context" });
      return;
    }

    // Basic Validation
    if (!title || !price || !category) {
      res.status(400).json({ message: "Please provide title, price, and category" });
      return;
    }

    // Save to Database
    const newSkill = await Skill.create({
      provider: providerId, // This is the '69b6aef2...' ID
      title,
      description,
      category,
      price,
      availability: availability || "Available"
    });

    res.status(201).json(newSkill);
  } catch (error) {
    console.error("Create Skill Error:", error);
    res.status(400).json({ message: "Failed to create skill. Check database connection." });
  }
};

// @desc    Get all skills (Public Marketplace)
// @access  Public
export const getSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    const skills = await Skill.find().populate('provider', 'name email');
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ message: "Error fetching marketplace skills" });
  }
};

// @desc    Get single skill by ID
// @access  Public
export const getSkillById = async (req: Request, res: Response): Promise<void> => {
  try {
    const skill = await Skill.findById(req.params.id).populate('provider', 'name email');
    
    if (!skill) {
      res.status(404).json({ message: "Skill not found" });
      return;
    }

    res.status(200).json(skill);
  } catch (error) {
    res.status(400).json({ message: "Invalid Skill ID format" });
  }
};