import type { Request, Response } from 'express';
import { Skill } from '../models/Skill.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get ONLY the logged-in provider's skills
export const getMySkills = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id; 
    if (!userId) {
      res.status(401).json({ message: "User not identified" });
      return;
    }
    const skills = await Skill.find({ provider: userId }).sort({ createdAt: -1 });
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your skills" });
  }
};

// @desc    Create a new skill with Cloudinary Images
// @access  Private
export const createSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, category, price, availability, location, tags } = req.body;
    const providerId = (req as any).user?._id;

    if (!providerId) {
      res.status(401).json({ message: "Unauthorized: Missing user context" });
      return;
    }

    // 1. HANDLE CLOUDINARY UPLOAD FROM MULTER FILES
    let uploadedImageUrls: string[] = [];
    const files = req.files as Express.Multer.File[];

    if (files && files.length > 0) {
      uploadedImageUrls = await Promise.all(
        files.map(async (file) => {
          // Convert buffer to base64 so Cloudinary can read it
          const b64 = Buffer.from(file.buffer).toString("base64");
          const dataURI = "data:" + file.mimetype + ";base64," + b64;
          
          const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'skills_marketplace',
          });
          return result.secure_url;
        })
      );
    }

    // 2. SAVE TO DATABASE
    const newSkill = await Skill.create({
      provider: providerId,
      title,
      description,
      category,
      price: Number(price), // Multer sends everything as string, so convert to Number
      images: uploadedImageUrls,
      location: location || "Remote",
      tags: typeof tags === 'string' ? tags.split(',') : tags || [], // Handle comma-separated tags
      availability: availability || "Available"
    });

    res.status(201).json(newSkill);
  } catch (error: any) {
    console.error("Detailed Error:", error);
    res.status(400).json({ 
      message: "Failed to create skill.",
      error: error.message 
    });
  }
};

// @desc    Get all skills (Public Marketplace)
export const getSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    const skills = await Skill.find().populate('provider', 'name email');
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ message: "Error fetching marketplace skills" });
  }
};

// @desc    Get single skill by ID
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

// @desc    Update a skill
export const updateSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, price } = req.body;
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      res.status(404).json({ message: "Skill not found" });
      return;
    }

    if (skill.provider.toString() !== (req as any).user._id) {
      res.status(401).json({ message: "Not authorized to update this skill" });
      return;
    }

    skill.title = title || skill.title;
    skill.description = description || skill.description;
    skill.price = price ? Number(price) : skill.price;

    const updatedSkill = await skill.save();
    res.status(200).json(updatedSkill);
  } catch (error) {
    res.status(400).json({ message: "Invalid data provided" });
  }
};

// @desc    Toggle availability
export const toggleSkillStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { availability } = req.body;
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      res.status(404).json({ message: "Skill not found" });
      return;
    }

    if (skill.provider.toString() !== (req as any).user._id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    skill.availability = availability;
    await skill.save();
    res.status(200).json({ message: `Status updated to ${availability}`, skill });
  } catch (error) {
    res.status(400).json({ message: "Error updating status" });
  }
};

// @desc    Delete skill and Cloudinary images
export const deleteSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      res.status(404).json({ message: "Skill not found" });
      return;
    }

    if (skill.provider.toString() !== (req as any).user._id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    if (skill.images && skill.images.length > 0) {
      await Promise.all(
        skill.images.map(async (url) => {
          const publicId = url.split('/').pop()?.split('.')[0];
          if (publicId) await cloudinary.uploader.destroy(`skills_marketplace/${publicId}`);
        })
      );
    }

    await skill.deleteOne();
    res.status(200).json({ message: "Skill and images removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error during deletion" });
  }
};