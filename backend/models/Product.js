import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true
    },
    brand: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price']
    },
    originalPrice: Number,
    discount: { type: Number, default: 0 },
    description: String,
    images: [String],
    stock: {
      type: Number,
      required: true,
      default: 0
    },
    rating: { type: Number, default: 4 },
    numReviews: { type: Number, default: 0 },
    category: { type: String, default: 'phones' },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    totalSold: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);