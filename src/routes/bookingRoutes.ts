import { Router } from 'express';
import { 
  createBooking, 
  getMyRequests, 
  cancelBooking, 
  getProviderJobs, 
  acceptBooking,
  completeBooking
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { createReview, getProviderReviews } from '../controllers/reviewController.js';
import { isSeeker } from '../middleware/roleMiddleware.js';

const router = Router();

// All booking routes require a logged-in user
router.use(protect);

// Seeker Routes
router.post('/', isSeeker, createBooking);            // Hire
router.get('/my-requests', isSeeker, getMyRequests);  // View history
router.patch('/:id/cancel', cancelBooking); // Cancel

// Provider Routes
router.get('/my-jobs', getProviderJobs);   
router.patch('/:id/accept', protect, acceptBooking);
router.patch('/:id/complete', protect, completeBooking); 



// ... existing booking routes

// Seeker posts a review
router.post('/reviews', protect, isSeeker, createReview);

// Public can see provider reviews
router.get('/reviews/provider/:providerId', getProviderReviews);

export default router;