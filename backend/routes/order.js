import express from 'express';
import { getAllOrders, getOrderDetails, updateOrderStatus, cancelOrder, generateInvoice } from '../controllers/orderController.js';
import { adminLogin, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', adminLogin, checkPermission('manageOrders'), getAllOrders);
router.get('/:id', adminLogin, checkPermission('manageOrders'), getOrderDetails);
router.put('/:id', adminLogin, checkPermission('manageOrders'), updateOrderStatus);
router.post('/:id/cancel', adminLogin, checkPermission('manageOrders'), cancelOrder);
router.get('/:id/invoice', adminLogin, checkPermission('manageOrders'), generateInvoice);

export default router;