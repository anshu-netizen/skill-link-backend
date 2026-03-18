import { Schema, model, type Types } from 'mongoose';

interface ISkill {
  provider: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  price: number;
  availability: string;
  images: string[];    // New: For professional gallery
  location: string;  // New: For the Explore page info
  tags: string[];      // New: For better searchability
}

const skillSchema = new Schema<ISkill>({
  provider: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }], // Array of strings for URLs
  location: { type: String, default: 'Remote' },
  tags: [{ type: String }],
  availability: { type: String, default: 'Available' }
}, { timestamps: true });

export const Skill = model<ISkill>('Skill', skillSchema);