import type { Request, Response } from 'express';
import { Booking } from '../models/Booking.js';

// @desc    Seeker hires a provider
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { skillId, providerId, scheduledDate, totalPrice, message } = req.body;
    const seekerId = (req as any).user._id;

    const booking = await Booking.create({
      seeker: seekerId,
      provider: providerId,
      skill: skillId,
      scheduledDate,
      totalPrice,
      message,
      status: 'pending'
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: "Booking failed. Ensure all fields are valid." });
  }
};

// @desc    Seeker views their own hire history
export const getMyRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const seekerId = (req as any).user._id;
    const requests = await Booking.find({ seeker: seekerId })
      .populate('provider', 'name email')
      .populate('skill', 'title category price')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your requests." });
  }
};

// @desc    Seeker cancels their own pending request
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404).json({ message: "Booking not found." });
      return;
    }

    // Security: Only the owner (seeker) can cancel
    if (booking.seeker.toString() !== (req as any).user._id) {
      res.status(401).json({ message: "Unauthorized: You did not create this booking." });
      return;
    }

    if (booking.status !== 'pending') {
      res.status(400).json({ message: "Only pending bookings can be cancelled." });
      return;
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({ message: "Booking cancelled successfully.", booking });
  } catch (error) {
    res.status(500).json({ message: "Server error during cancellation." });
  }
};

// @desc    Provider views jobs requested from them
export const getProviderJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const providerId = (req as any).user._id;
    const jobs = await Booking.find({ provider: providerId })
      .populate('seeker', 'name email')
      .populate('skill', 'title category')
      .sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs." });
  }
};

// @desc    Provider: Accept a pending booking
// @route   PATCH /api/bookings/:id/accept
export const acceptBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404).json({ message: "Booking not found." });
      return;
    }

    // AUTH CHECK: Ensure only the assigned provider can accept
    if (booking.provider.toString() !== (req as any).user._id) {
      res.status(401).json({ message: "Unauthorized: This job is not assigned to you." });
      return;
    }

    booking.status = 'accepted';
    await booking.save();
    res.status(200).json({ message: "Booking accepted.", booking });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// @desc    Provider: Mark a job as finished/completed
// @route   PATCH /api/bookings/:id/complete
export const completeBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404).json({ message: "Booking not found." });
      return;
    }

    // AUTH CHECK: Only the provider can mark it complete
    if (booking.provider.toString() !== (req as any).user._id) {
      res.status(401).json({ message: "Unauthorized." });
      return;
    }

    // LOGIC CHECK: Can't complete a job that hasn't been accepted yet
    if (booking.status !== 'accepted') {
      res.status(400).json({ message: "You must 'accept' the booking before marking it as complete." });
      return;
    }

    booking.status = 'completed';
    await booking.save();
    res.status(200).json({ message: "Job marked as completed. The seeker can now review you.", booking });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};