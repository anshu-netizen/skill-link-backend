import { Router } from 'express';
import { getSkills, createSkill, getSkillById, getMySkills } from '../controllers/skillController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getSkills); // Public
router.get('/my-skills', protect, getMySkills); // Private (MUST be above /:id)
router.get('/:id', getSkillById); // Public/Dynamic

router.post('/', protect, createSkill); // Private

export default router;