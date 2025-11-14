import express from 'express';
import {
  getChatSession,
  sendMessage,
  getOrderStatus,
  getProductRecommendations,
  getChatHistory,
  closeChat,
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js'; // ✅ Changed from authMiddleware.js to auth.js

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/session', getChatSession);
router.post('/message', sendMessage);
router.post('/order-status', getOrderStatus);
router.post('/recommend', getProductRecommendations);
router.get('/history', getChatHistory);
router.put('/close/:sessionId', closeChat);

export default router;