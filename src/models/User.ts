import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  // Basic Info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Role
  role: { 
    type: String, 
    enum: ['seeker', 'provider'], 
    default: 'seeker' 
  },

  // Profile Info
  profileImage: { type: String }, // URL
  bio: { type: String },

  // Contact Info
  phone: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },

  // Skills (mainly for seekers)
  skills: [{ type: String }],

  // Education (for seekers)
  education: [
    {
      degree: String,
      institution: String,
      year: String,
    }
  ],

  // Experience (for seekers)
  experience: [
    {
      title: String,
      company: String,
      years: String,
      description: String,
    }
  ],

  // Resume
  resume: { type: String }, // file URL

  // For Job Providers (Company Info)
  company: {
    name: String,
    description: String,
    website: String,
    location: String,
  },

  // Social Links
  socialLinks: {
    linkedin: String,
    github: String,
    portfolio: String,
  },

  // Account Status
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  // Optional: Saved Jobs / Posted Jobs (refs)
  savedJobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
  postedJobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],

}, { timestamps: true });

export const User = model('User', userSchema);