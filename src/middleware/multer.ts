import multer from 'multer';

// Use memory storage so we don't clog up your server with temp files
// We will send the buffer directly to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export default upload;