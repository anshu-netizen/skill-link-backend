import type { Request, Response } from 'express';
import { Skill } from '../models/Skill.js';
import cloudinary from '../config/cloudinary.js';

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
// @desc    Create a new skill
// @access  Private

// @desc    Create a new skill with Cloudinary Images
// @access  Private
export const createSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, category, price, availability, images, location, tags } = req.body;
    const providerId = (req as any).user?._id;

    if (!providerId) {
      res.status(401).json({ message: "Unauthorized: Missing user context" });
      return;
    }

    // 1. UPLOAD IMAGES TO CLOUDINARY
    let uploadedImageUrls: string[] = [];
    
    if (images && Array.isArray(images) && images.length > 0) {
      // We use Promise.all to upload all images simultaneously for speed
      uploadedImageUrls = await Promise.all(
        images.map(async (image) => {
          const result = await cloudinary.uploader.upload(image, {
            folder: 'skills_marketplace', // Organizes images in your Cloudinary dashboard
          });
          return result.secure_url; // This is the permanent HTTPS link
        })
      );
    }

    // 2. SAVE TO DATABASE (Using your exact logic + new fields)
    const newSkill = await Skill.create({
      provider: providerId,
      title,
      description,
      category,
      price,
      images: uploadedImageUrls, // Saving the Cloudinary URLs here
      location: location || "Remote",
      tags: tags || [],
      availability: availability || "Available"
    });

    res.status(201).json(newSkill);
  } catch (error) {
    console.error("Cloudinary/Create Error:", error);
    res.status(400).json({ message: "Failed to create skill with images." });
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

// @desc    Update a skill (Title, Description, Price)
// @route   PATCH /api/skills/:id
export const updateSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, price } = req.body;
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      res.status(404).json({ message: "Skill not found" });
      return;
    }

    // AUTH CHECK: Ensure the logged-in user owns this skill
    if (skill.provider.toString() !== (req as any).user._id) {
      res.status(401).json({ message: "Not authorized to update this skill" });
      return;
    }

    skill.title = title || skill.title;
    skill.description = description || skill.description;
    skill.price = price || skill.price;

    const updatedSkill = await skill.save();
    res.status(200).json(updatedSkill);
  } catch (error) {
    res.status(400).json({ message: "Invalid data provided" });
  }
};

// @desc    Toggle availability (Available vs Busy)
// @route   PATCH /api/skills/:id/status
export const toggleSkillStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { availability } = req.body; // Expecting "Available" or "Busy"
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

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @desc    Delete a skill and its Cloudinary images
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

    // DELETE FROM CLOUDINARY
    if (skill.images && skill.images.length > 0) {
      await Promise.all(
        skill.images.map(async (url) => {
          // Extracts the Public ID from the URL to tell Cloudinary what to delete
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