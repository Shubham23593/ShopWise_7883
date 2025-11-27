import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Brand from '../models/Brand.js';

// Get Dashboard Overview
export const getDashboardOverview = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalBrands = await Brand.countDocuments();

    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);

    const recentOrders = await Order.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5);

    const topProducts = await Product.find()
      .sort({ totalSold: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalOrders,
          totalUsers,
          totalProducts,
          totalBrands,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        recentOrders,
        topProducts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Sales Chart Data
export const getSalesChartData = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    const orders = await Order.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'daily' ? '%Y-%m-%d' : '%Y-%m',
              date: '$createdAt'
            }
          },
          total: { $sum: '$finalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getDashboardOverview,
  getSalesChartData
};