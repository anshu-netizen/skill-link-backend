import { Router } from 'express';
import { 
  createBooking, 
  getMyRequests, 
  cancelBooking, 
  getProviderJobs 
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isSeeker } from '../middleware/roleMiddleware.js';

const router = Router();

// All booking routes require a logged-in user
router.use(protect);

// Seeker Routes
router.post('/', isSeeker, createBooking);            // Hire
router.get('/my-requests', isSeeker, getMyRequests);  // View history
router.patch('/:id/cancel', cancelBooking); // Cancel

// Provider Routes
router.get('/my-jobs', getProviderJobs);    // View jobs assigned to me

export default router;