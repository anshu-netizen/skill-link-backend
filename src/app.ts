import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js'; 
import skillRoutes from './routes/skillRoutes.js'

dotenv.config();
const app = express();

app.use(cors({
  origin: 'https://skill-link-frontend-rouge.vercel.app/',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.log("❌ Connection Error:", err));