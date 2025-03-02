import express from 'express';
import { messageController } from '../controllers/messageController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @route POST /api/messages/send
 * @desc Send a message to a doctor and send confirmation email to user
 * @access Private (requires authentication)
 */
router.post('/send', authenticateToken, messageController.sendMessage);

export default router;