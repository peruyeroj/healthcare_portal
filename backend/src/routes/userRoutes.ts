import express from 'express';
import { updatePersonalInfo, getPersonalInfo, updateInsuranceInfo, getInsuranceInfo } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Personal information routes
router.put('/personal-info', authenticateToken, updatePersonalInfo);
router.get('/personal-info', authenticateToken, getPersonalInfo);

// Insurance information routes
router.put('/insurance-info', authenticateToken, updateInsuranceInfo);
router.get('/insurance-info', authenticateToken, getInsuranceInfo);

export default router;