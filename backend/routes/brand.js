import express from 'express';
import { getAllBrands, addBrand, editBrand, deleteBrand, setFeaturedBrand } from '../controllers/brandController.js';
import { adminLogin, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/', adminLogin, getAllBrands);
router.post('/', adminLogin, checkPermission('manageBrands'), addBrand);
router.put('/:id', adminLogin, checkPermission('manageBrands'), editBrand);
router.delete('/:id', adminLogin, checkPermission('manageBrands'), deleteBrand);
router.post('/:id/featured', adminLogin, checkPermission('manageBrands'), setFeaturedBrand);

export default router;