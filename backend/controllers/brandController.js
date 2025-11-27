import Brand from '../models/Brand.js';

// Get all brands
export const getAllBrands = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const brands = await Brand.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Brand.countDocuments(query);

    res.status(200).json({
      success: true,
      data: brands,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add new brand
export const addBrand = async (req, res) => {
  try {
    const { name, description, website, country, logo } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Brand name is required'
      });
    }

    const brandExists = await Brand.findOne({ name });

    if (brandExists) {
      return res.status(400).json({
        success: false,
        message: 'Brand already exists'
      });
    }

    const brand = await Brand.create({
      name,
      description,
      website,
      country,
      logo,
      createdBy: req.admin.id
    });

    res.status(201).json({
      success: true,
      message: 'Brand added successfully',
      data: brand
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Edit brand
export const editBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, website, country, logo } = req.body;

    const brand = await Brand.findByIdAndUpdate(
      id,
      { name, description, website, country, logo },
      { new: true }
    );

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Brand updated',
      data: brand
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete brand
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findByIdAndDelete(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Brand deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Set featured brand
export const setFeaturedBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    const brand = await Brand.findByIdAndUpdate(
      id,
      { isFeatured },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Brand featured status updated',
      data: brand
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getAllBrands,
  addBrand,
  editBrand,
  deleteBrand,
  setFeaturedBrand
};