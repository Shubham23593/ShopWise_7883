const express = require('express');
const Product = require('../models/Product');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Mock data from frontend - in a real app, this would be populated from database
const mockProducts = [
  { id: 1, name: "iPhone 16", price: 79999, image: "https://example.com/iphone16.jpg", brand: "Apple" },
  { id: 2, name: "Samsung Galaxy S24", price: 74999, image: "https://example.com/s24.jpg", brand: "Samsung" },
  // Add more mock products as needed
];

// @route   GET /api/products
// @desc    Get all products with optional filtering and search
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      brand,
      category,
      minPrice,
      maxPrice,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query object
    let query = { isActive: true };
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Brand filter
    if (brand) {
      query.brand = brand;
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // For now, return mock data - in production, use database query
    let products = mockProducts;
    
    // Apply search filter if provided
    if (search) {
      products = products.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.brand.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply brand filter
    if (brand) {
      products = products.filter(product => 
        product.brand.toLowerCase() === brand.toLowerCase()
      );
    }
    
    // Apply price filter
    if (minPrice || maxPrice) {
      products = products.filter(product => {
        let match = true;
        if (minPrice) match = match && product.price >= parseFloat(minPrice);
        if (maxPrice) match = match && product.price <= parseFloat(maxPrice);
        return match;
      });
    }
    
    // Apply pagination
    const startIndex = skip;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = products.slice(startIndex, endIndex);
    
    res.status(200).json({
      products: paginatedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: products.length,
        pages: Math.ceil(products.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // For now, find in mock data
    const product = mockProducts.find(p => p.id === parseInt(id));
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
});

// @route   GET /api/products/brands
// @desc    Get all available brands
// @access  Public
router.get('/meta/brands', async (req, res) => {
  try {
    // Extract unique brands from mock data
    const brands = [...new Set(mockProducts.map(p => p.brand))];
    
    res.status(200).json({ brands });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ message: 'Server error while fetching brands' });
  }
});

// @route   GET /api/products/categories
// @desc    Get all available categories
// @access  Public
router.get('/meta/categories', async (req, res) => {
  try {
    // Extract unique categories from mock data
    const categories = [...new Set(mockProducts.map(p => p.category).filter(Boolean))];
    
    res.status(200).json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
});

module.exports = router;