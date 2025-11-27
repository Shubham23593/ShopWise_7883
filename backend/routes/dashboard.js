import express from 'express';
import { getDashboardOverview, getSalesChartData } from '../controllers/dashboardController.js';
import { adminLogin, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/overview', adminLogin, checkPermission('viewDashboard'), getDashboardOverview);
router.get('/sales-chart', adminLogin, checkPermission('viewDashboard'), getSalesChartData);

export default router;
