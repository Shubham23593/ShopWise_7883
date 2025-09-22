const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { auth } = require('../middleware/auth');

const router = express.Router();

// All order routes require authentication
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

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product');
    
    const total = await Order.countDocuments({ user: req.user._id });
    
    res.status(200).json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// @route   GET /api/orders/:orderId
// @desc    Get specific order
// @access  Private
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id
    }).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', [
  body('shippingAddress.name').notEmpty().withMessage('Name is required'),
  body('shippingAddress.email').isEmail().withMessage('Valid email is required'),
  body('shippingAddress.address').notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
  body('paymentMethod').isIn(['cod', 'card', 'upi']).withMessage('Valid payment method is required')
], handleValidationErrors, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Create order items from cart
    const orderItems = cart.products.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
      totalPrice: item.totalPrice
    }));
    
    // Create new order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalQuantity: cart.totalQuantity,
      totalPrice: cart.totalPrice,
      shippingAddress,
      paymentMethod,
      notes
    });
    
    await order.save();
    
    // Clear the cart after successful order
    cart.products = [];
    cart.totalQuantity = 0;
    cart.totalPrice = 0;
    await cart.save();
    
    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
});

// @route   PUT /api/orders/:orderId/cancel
// @desc    Cancel an order
// @access  Private
router.put('/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending orders can be cancelled' 
      });
    }
    
    order.status = 'cancelled';
    await order.save();
    
    res.status(200).json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error while cancelling order' });
  }
});

// @route   GET /api/orders/search/:orderNumber
// @desc    Search order by order number
// @access  Private
router.get('/search/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    const order = await Order.findOne({
      orderNumber: orderNumber.toUpperCase(),
      user: req.user._id
    }).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json({ order });
  } catch (error) {
    console.error('Search order error:', error);
    res.status(500).json({ message: 'Server error while searching order' });
  }
});

module.exports = router;