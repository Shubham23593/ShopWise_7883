import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide brand name'],
      unique: true,
      trim: true
    },
    logo: String,
    description: String,
    website: String,
    country: String,
    isFeatured: { type: Boolean, default: false },
    totalProducts: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    createdBy: mongoose.Schema.Types.ObjectId,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('Brand', brandSchema);