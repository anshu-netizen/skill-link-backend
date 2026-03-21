import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  seeker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  appointmentTime: { type: Date, required: true },
  duration: { type: Number, default: 60 },
  totalPrice: { type: Number, required: true },
  message: { type: String },
  location: { type: String },
  
  // --- ADD THIS FIELD ---
  // This allows you to populate the review data when fetching bookings
  review: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Review', 
    default: null 
  }
}, { timestamps: true });

// Index for high-performance scheduling queries
bookingSchema.index({ provider: 1, appointmentTime: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);