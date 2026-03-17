import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  seeker: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  provider: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  skill: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Skill', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  scheduledDate: { 
    type: Date, 
    required: true 
  },
  totalPrice: { 
    type: Number, 
    required: true 
  },
  message: { 
    type: String 
  }
}, { timestamps: true });

export const Booking = mongoose.model('Booking', bookingSchema);