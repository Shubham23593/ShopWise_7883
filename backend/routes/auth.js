const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/email');
const { auth } = require('../middleware/auth');
const passport = require('../config/passport');

const router = express.Router();

// Validation middleware
const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateOTP = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits')
];

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

// @route   POST /api/auth/signup
// @desc    Register user and send OTP
// @access  Public
router.post('/signup', validateSignup, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: 'User already exists and is verified' });
      }
      // User exists but not verified, resend OTP
      const otp = existingUser.generateOTP('signup');
      await existingUser.save();
      await sendOTPEmail(email, otp, 'signup');
      return res.status(200).json({ message: 'OTP sent to your email for verification' });
    }
    
    // Create new user
    const user = new User({ name, email, password });
    const otp = user.generateOTP('signup');
    await user.save();
    
    // Send OTP email
    await sendOTPEmail(email, otp, 'signup');
    
    res.status(201).json({
      message: 'User registered successfully. Please check your email for OTP verification.',
      email
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and complete registration
// @access  Public
router.post('/verify-otp', validateOTP, handleValidationErrors, async (req, res) => {
  try {
    const { email, otp, type = 'signup' } = req.body;
    
    const user = await User.findOne({ email }).select('+otp');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.verifyOTP(otp, type)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.clearOTP();
    await user.save();
    
    // Send welcome email for signup verification
    if (type === 'signup') {
      await sendWelcomeEmail(email, user.name);
    }
    
    // Generate tokens
    const tokens = generateTokenPair(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();
    
    res.status(200).json({
      message: 'OTP verified successfully',
      user: user.toJSON(),
      ...tokens
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      const otp = user.generateOTP('signup');
      await user.save();
      await sendOTPEmail(email, otp, 'signup');
      return res.status(401).json({ 
        message: 'Please verify your email first. New OTP sent to your email.',
        requiresVerification: true
      });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate tokens
    const tokens = generateTokenPair(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();
    
    res.status(200).json({
      message: 'Login successful',
      user: user.toJSON(),
      ...tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }
    
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select('+refreshToken');
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    // Generate new token pair
    const tokens = generateTokenPair(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();
    
    res.status(200).json(tokens);
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send OTP for password reset
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], handleValidationErrors, async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return res.status(200).json({ message: 'If the email exists, an OTP has been sent' });
    }
    
    const otp = user.generateOTP('reset');
    await user.save();
    
    await sendOTPEmail(email, otp, 'reset');
    
    res.status(200).json({ message: 'If the email exists, an OTP has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with OTP
// @access  Public
router.post('/reset-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], handleValidationErrors, async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const user = await User.findOne({ email }).select('+otp +password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.verifyOTP(otp, 'reset')) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    // Update password
    user.password = newPassword;
    user.clearOTP();
    user.refreshToken = undefined; // Invalidate all refresh tokens
    await user.save();
    
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // Clear refresh token
    req.user.refreshToken = undefined;
    await req.user.save();
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  res.status(200).json({ user: req.user });
});

// Google OAuth routes
// @route   GET /api/auth/google
// @desc    Start Google OAuth flow
// @access  Public
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      // Generate tokens for the user
      const tokens = generateTokenPair(req.user._id);
      req.user.refreshToken = tokens.refreshToken;
      await req.user.save();
      
      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?` +
        `accessToken=${tokens.accessToken}&` +
        `refreshToken=${tokens.refreshToken}&` +
        `user=${encodeURIComponent(JSON.stringify(req.user.toJSON()))}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/auth/error`);
    }
  }
);

module.exports = router;