import { Router } from 'express';
import { 
  getSkills, createSkill, getSkillById, getMySkills,
  updateSkill, deleteSkill, toggleSkillStatus 
} from '../controllers/skillController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Get Routes
router.get('/', getSkills);
router.get('/my-skills', protect, getMySkills);
router.get('/:id', getSkillById);

// Action Routes
router.post('/', protect, createSkill);
router.patch('/:id', protect, updateSkill);
router.patch('/:id/status', protect, toggleSkillStatus);
router.delete('/:id', protect, deleteSkill);

export default router;