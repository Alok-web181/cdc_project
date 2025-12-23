import mongoose from 'mongoose';

const ShoeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a shoe name'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Please provide a brand name'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    sales: {
      type: Number,
      default: 0,
      min: 0,
    },
    salesHistory: {
      type: [{
        sales: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        discount: {
          type: Number,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Add virtual for final price
ShoeSchema.virtual('finalPrice').get(function () {
  return this.price - (this.price * this.discount) / 100;
});

// Ensure virtuals are included in JSON
ShoeSchema.set('toJSON', { virtuals: true });
ShoeSchema.set('toObject', { virtuals: true });

export default mongoose.models.Shoe || mongoose.model('Shoe', ShoeSchema);