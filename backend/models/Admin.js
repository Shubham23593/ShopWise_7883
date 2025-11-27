import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide admin name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide admin email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'manager'],
      default: 'admin'
    },
    permissions: {
      viewDashboard: { type: Boolean, default: true },
      manageProducts: { type: Boolean, default: true },
      manageOrders: { type: Boolean, default: true },
      manageUsers: { type: Boolean, default: true },
      manageBrands: { type: Boolean, default: true },
      manageOffers: { type: Boolean, default: true },
      viewReports: { type: Boolean, default: true },
      editSettings: { type: Boolean, default: false }
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    createdBy: mongoose.Schema.Types.ObjectId,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
adminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

export default mongoose.model('Admin', adminSchema);