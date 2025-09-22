const express = require('express');
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(auth);

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('products.product');
    
    if (!cart) {
      // Create empty cart if doesn't exist
      cart = new Cart({
        user: req.user._id,
        products: [],
        totalQuantity: 0,
        totalPrice: 0
      });
      await cart.save();
    }
    
    res.status(200).json({ cart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error while fetching cart' });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', [
  body('productId').isNumeric().withMessage('Product ID must be a number'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], handleValidationErrors, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Find the product in our mock data structure (you can modify this to use Product model)
    // For now, we'll accept the product data from frontend
    const productData = req.body.product;
    
    if (!productData) {
      return res.status(400).json({ message: 'Product data is required' });
    }
    
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        products: [],
        totalQuantity: 0,
        totalPrice: 0
      });
    }
    
    // Check if product already exists in cart
    const existingItemIndex = cart.products.findIndex(
      item => item.productId === parseInt(productId)
    );
    
    if (existingItemIndex > -1) {
      // Update existing item
      const existingItem = cart.products[existingItemIndex];
      existingItem.quantity += quantity;
      existingItem.totalPrice = existingItem.quantity * existingItem.price;
    } else {
      // Add new item
      const newItem = {
        productId: parseInt(productId),
        name: productData.name,
        price: productData.price,
        image: productData.image,
        quantity: quantity,
        totalPrice: productData.price * quantity
      };
      cart.products.push(newItem);
    }
    
    await cart.save();
    
    res.status(200).json({
      message: 'Item added to cart successfully',
      cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error while adding to cart' });
  }
});

// @route   PUT /api/cart/update/:productId
// @desc    Update item quantity in cart
// @access  Private
router.put('/update/:productId', [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], handleValidationErrors, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.products.findIndex(
      item => item.productId === parseInt(productId)
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    const item = cart.products[itemIndex];
    item.quantity = quantity;
    item.totalPrice = item.price * quantity;
    
    await cart.save();
    
    res.status(200).json({
      message: 'Cart updated successfully',
      cart
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error while updating cart' });
  }
});

// @route   DELETE /api/cart/remove/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.products.findIndex(
      item => item.productId === parseInt(productId)
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    cart.products.splice(itemIndex, 1);
    await cart.save();
    
    res.status(200).json({
      message: 'Item removed from cart successfully',
      cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error while removing from cart' });
  }
});

// @route   POST /api/cart/increase/:productId
// @desc    Increase item quantity by 1
// @access  Private
router.post('/increase/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.products.findIndex(
      item => item.productId === parseInt(productId)
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    const item = cart.products[itemIndex];
    item.quantity += 1;
    item.totalPrice = item.price * item.quantity;
    
    await cart.save();
    
    res.status(200).json({
      message: 'Item quantity increased',
      cart
    });
  } catch (error) {
    console.error('Increase quantity error:', error);
    res.status(500).json({ message: 'Server error while increasing quantity' });
  }
});

// @route   POST /api/cart/decrease/:productId
// @desc    Decrease item quantity by 1
// @access  Private
router.post('/decrease/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.products.findIndex(
      item => item.productId === parseInt(productId)
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    const item = cart.products[itemIndex];
    
    if (item.quantity <= 1) {
      // Remove item if quantity would be 0
      cart.products.splice(itemIndex, 1);
    } else {
      item.quantity -= 1;
      item.totalPrice = item.price * item.quantity;
    }
    
    await cart.save();
    
    res.status(200).json({
      message: 'Item quantity decreased',
      cart
    });
  } catch (error) {
    console.error('Decrease quantity error:', error);
    res.status(500).json({ message: 'Server error while decreasing quantity' });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        products: [],
        totalQuantity: 0,
        totalPrice: 0
      });
    } else {
      cart.products = [];
      cart.totalQuantity = 0;
      cart.totalPrice = 0;
    }
    
    await cart.save();
    
    res.status(200).json({
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error while clearing cart' });
  }
});

module.exports = router;