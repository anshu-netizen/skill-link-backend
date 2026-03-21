import type { Request, Response } from 'express';
import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';

// @desc    Create a review for a completed job
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId, rating, comment } = req.body;
    const seekerId = (req as any).user._id;

    // 1. Find the booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      res.status(404).json({ message: "Booking not found." });
      return;
    }

    // 2. Security: Only the seeker who made the booking can review it
    if (booking.seeker.toString() !== seekerId.toString()) {
      res.status(403).json({ message: "Unauthorized: You did not book this service." });
      return;
    }

    // 3. Logic: Can only review completed jobs
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

    // 5. CRITICAL: Update the Booking to reference this review
    // This allows your frontend's !booking.review check to work correctly
    booking.review = review._id;
    await booking.save();

    // 6. Return populated review for immediate UI feedback
    const populatedReview = await Review.findById(review._id)
      .populate('provider', 'name email')
      .populate('skill', 'title')
      .populate('booking', 'totalPrice status');

    res.status(201).json(populatedReview);

  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: "You have already reviewed this booking." });
    } else {
      console.error("Review Error:", error);
      res.status(500).json({ message: "Error submitting review." });
    }
  }
};

// @desc    Get all reviews for a specific provider
export const getProviderReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('seeker', 'name')
      .populate('skill', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews." });
  }
};