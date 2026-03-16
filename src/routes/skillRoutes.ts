import { Router } from 'express';
import { getSkills, createSkill, getSkillById, getMySkills } from '../controllers/skillController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Public route: Anyone can browse
router.get('/', getSkills);
router.get('/my-skills', protect, getMySkills);
router.get('/:id', getSkillById);

// Protected route: Only logged-in users can post a skill
router.post('/', protect, createSkill);


export default router;