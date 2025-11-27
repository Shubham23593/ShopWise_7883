import express from 'express';
import {
  getAllPhones,
  getPhonesByBrand,
  getPhoneById,
  searchPhones,
  getPhoneBrands,
  addProduct,
  editProduct,
  deleteProduct,
  getAllProducts
} from '../controllers/productController.js';
import { admin } from '../middleware/auth.js';

const router = express.Router();

// Customer routes - Public
router.get('/', getAllPhones);
router.get('/search', searchPhones);
router.get('/brands', getPhoneBrands);
router.get('/brand/:brand', getPhonesByBrand);
router.get('/:id', getPhoneById);

// Admin routes - Protected
router.post('/', admin, addProduct);
router.put('/:id', admin, editProduct);
router.delete('/:id', admin, deleteProduct);

export default router;