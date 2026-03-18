import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config(); 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,    // Make sure this matches .env
  api_secret: process.env.CLOUDINARY_API_SECRET, // Make sure this matches .env
  secure: true
});

// This will log in your terminal (NOT Postman) when the server starts
console.log("--- Cloudinary Check ---");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("Key Loaded:", !!process.env.CLOUDINARY_API_KEY); // Returns true or false
console.log("-----------------------");

export default cloudinary;