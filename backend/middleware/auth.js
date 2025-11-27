import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// ============================================
// CUSTOMER AUTH MIDDLEWARE
// ============================================

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.message
    });
  }
};

// ============================================
// ADMIN AUTH MIDDLEWARE
// ============================================

export const adminLogin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin || admin.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Admin not found or inactive'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.message
    });
  }
};

export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    }
    next();
  };
};

export const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient privileges'
      });
    }
    next();
  };
};

// Admin middleware (for old routes)
export const admin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin || admin.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Admin not found or inactive'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

export default {
  protect,
  adminLogin,
  checkPermission,
  checkRole,
  admin
};