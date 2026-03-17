import type { Request, Response } from 'express';
import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';

// @desc    Create a review for a completed job
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId, rating, comment } = req.body;
    const seekerId = (req as any).user._id;

    // 1. Find the booking and verify it exists
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      res.status(404).json({ message: "Booking not found." });
      return;
    }

    // 2. Safety Check: Only the seeker who hired can review
    if (booking.seeker.toString() !== seekerId) {
      res.status(403).json({ message: "Unauthorized: You did not book this service." });
      return;
    }

    // 3. Status Check: Can only review if the job is finished
    if (booking.status !== 'completed') {
      res.status(400).json({ message: "You can only review a service after it is marked as completed." });
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

    res.status(201).json(review);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: "You have already reviewed this booking." });
    } else {
      res.status(500).json({ message: "Error submitting review." });
    }
  }
};

// @desc    Get all reviews for a specific provider (Marketplace Profile)
export const getProviderReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('seeker', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews." });
  }
};