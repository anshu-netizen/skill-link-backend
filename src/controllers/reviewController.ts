import type { Request, Response } from 'express';
import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';

// @desc    Create a review for a completed job
// @route   POST /api/bookings/reviews
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId, rating, comment } = req.body;
    const seekerId = (req as any).user._id;

    // 1. Validate Booking Existence
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      res.status(404).json({ message: "Booking not found." });
      return;
    }

    // 2. LOGIC CHECK: Must be 'completed'
    // If you get 400, verify in Atlas/Compass that status is exactly 'completed'
    if (booking.status !== 'completed') {
      res.status(400).json({ 
        message: `Cannot review. Booking status is '${booking.status}', must be 'completed'.` 
      });
      return;
    }

    // 3. SECURITY CHECK: Only the seeker who booked it can review
    if (booking.seeker.toString() !== seekerId.toString()) {
      res.status(403).json({ message: "Unauthorized: You did not make this booking." });
      return;
    }

    // 4. Create the Review
    const review = await Review.create({
      booking: bookingId,
      seeker: seekerId,
      provider: booking.provider,
      skill: booking.skill,
      rating,
      comment
    });

    // 5. CRITICAL LINK: Update the Booking record
    // This makes booking.review truthy so the frontend hides the button
    booking.review = review._id;
    await booking.save();

    res.status(201).json(review);

  } catch (error: any) {
    // Handle Duplicate Review (Unique Index on bookingId in Review Model)
    if (error.code === 11000) {
      res.status(400).json({ message: "You have already reviewed this booking." });
    } else {
      console.error("Review Error:", error);
      res.status(500).json({ message: "Internal server error while saving review." });
    }
  }
};

// @desc    Get all reviews for a specific provider
// @route   GET /api/bookings/reviews/provider/:providerId
export const getProviderReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { providerId } = req.params;
    const reviews = await Review.find({ provider: providerId })
      .populate('seeker', 'name')
      .populate('skill', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews." });
  }
};