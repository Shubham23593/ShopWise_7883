const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not Google OAuth user
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  googleId: {
    type: String,
    sparse: true // Allow multiple null values
  },
  avatar: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  refreshToken: {
    type: String,
    select: false
  },
  otp: {
    code: {
      type: String,
      select: false
    },
    expires: {
      type: Date,
      select: false
    },
    type: {
      type: String,
      enum: ['signup', 'reset'],
      select: false
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  phoneNumber: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate OTP
userSchema.methods.generateOTP = function(type = 'signup') {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  this.otp = {
    code: otp,
    expires,
    type
  };
  
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function(candidateOTP, type) {
  if (!this.otp || !this.otp.code || !this.otp.expires || this.otp.type !== type) {
    return false;
  }
  
  if (Date.now() > this.otp.expires.getTime()) {
    return false; // OTP expired
  }
  
  return this.otp.code === candidateOTP;
};

// Clear OTP
userSchema.methods.clearOTP = function() {
  this.otp = undefined;
};

// Convert to JSON (remove sensitive fields)
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  delete userObject.otp;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);