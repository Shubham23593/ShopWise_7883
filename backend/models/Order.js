import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        name: String,
        price: Number,
        quantity: Number,
        image: String
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    discount: { type: Number, default: 0 },
    finalAmount: Number,
    paymentMethod: {
      type: String,
      enum: ['COD', 'Card', 'UPI', 'NetBanking'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Pending'
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'],
      default: 'Pending'
    },
    shippingAddress: {
      name: String,
      phone: String,
      email: String,
      address: String,
      city: String,
      state: String,
      pincode: String
    },
    trackingNumber: String,
    shippingDate: Date,
    deliveryDate: Date,
    notes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);