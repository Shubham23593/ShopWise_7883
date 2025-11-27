import Product from '../models/Product.js';

// Get all phones
export const getAllPhones = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const products = await Product.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({ status: 'active' });

    res.json({
      success: true,
      message: '✅ Phones fetched successfully',
      data: {
        products,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get phones by brand
export const getPhonesByBrand = async (req, res) => {
  try {
    const { brand } = req.params;
    const limit = parseInt(req.query.limit) || 12;

    const products = await Product.find({
      brand: { $regex: brand, $options: 'i' },
      status: 'active'
    }).limit(limit);

    res.json({
      success: true,
      message: `✅ ${brand} phones fetched`,
      data: {
        products,
        total: products.length,
        brand
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single phone
export const getPhoneById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Phone not found'
      });
    }

    res.json({
      success: true,
      message: '✅ Phone fetched',
      data: product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search phones
export const searchPhones = async (req, res) => {
  try {
    const { query } = req.query;
    const limit = parseInt(req.query.limit) || 12;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query required'
      });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ],
      status: 'active'
    }).limit(limit);

    res.json({
      success: true,
      message: `✅ Found ${products.length} phones`,
      data: {
        products,
        query,
        total: products.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get phone brands
export const getPhoneBrands = async (req, res) => {
  try {
    const brands = await Product.distinct('brand', { status: 'active' });

    res.json({
      success: true,
      message: `✅ Found ${brands.length} brands`,
      data: {
        brands: brands.sort(),
        total: brands.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add product (Admin)
export const addProduct = async (req, res) => {
  try {
    const { name, brand, price, originalPrice, description, images, stock, discount } = req.body;

    if (!name || !brand || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name, brand, and price are required'
      });
    }

    const product = await Product.create({
      name,
      brand,
      price,
      originalPrice: originalPrice || price,
      description,
      images: images || [],
      stock: stock || 0,
      discount: discount || 0
    });

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Edit product (Admin)
export const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated',
      data: product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete product (Admin)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all products (Admin)
export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, brand, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (brand) {
      query.brand = brand;
    }

    if (status) {
      query.status = status;
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getAllPhones,
  getPhonesByBrand,
  getPhoneById,
  searchPhones,
  getPhoneBrands,
  addProduct,
  editProduct,
  deleteProduct,
  getAllProducts
};