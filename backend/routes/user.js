import express from 'express';
import { getAllUsers, getUserProfile, blockUser, unblockUser, deleteUser, getUserOrderHistory } from '../controllers/userController.js';
import { adminLogin, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', adminLogin, checkPermission('manageUsers'), getAllUsers);
router.get('/:id', adminLogin, checkPermission('manageUsers'), getUserProfile);
router.post('/:id/block', adminLogin, checkPermission('manageUsers'), blockUser);
router.post('/:id/unblock', adminLogin, checkPermission('manageUsers'), unblockUser);
router.delete('/:id', adminLogin, checkPermission('manageUsers'), deleteUser);
router.get('/:id/orders', adminLogin, checkPermission('manageUsers'), getUserOrderHistory);

export default router;