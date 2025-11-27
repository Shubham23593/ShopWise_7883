import Order from '../models/Order.js';

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (status) {
      query.orderStatus = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.email': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
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

// Get order details
export const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('userId', 'name email phone address')
      .populate('products.productId', 'name image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, trackingNumber, notes } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus,
        trackingNumber: trackingNumber || order?.trackingNumber,
        notes,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Order updated',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: 'Cancelled',
        notes: reason,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Order cancelled',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Generate invoice
export const generateInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('userId', 'name email phone')
      .populate('products.productId', 'name image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Generate invoice data
    const invoiceData = {
      orderNumber: order.orderNumber,
      date: new Date(order.createdAt).toLocaleDateString(),
      customer: order.userId,
      products: order.products,
      totalAmount: order.finalAmount,
      shippingAddress: order.shippingAddress
    };

    res.status(200).json({
      success: true,
      data: invoiceData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder,
  generateInvoice
};