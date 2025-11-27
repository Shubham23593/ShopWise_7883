import express from 'express';
import { adminLoginController, getAdminProfile, updateAdminProfile, changePassword } from '../controllers/adminController.js';
import { adminLogin } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', adminLoginController);
router.get('/profile', adminLogin, getAdminProfile);
router.put('/profile', adminLogin, updateAdminProfile);
router.post('/change-password', adminLogin, changePassword);

export default router;