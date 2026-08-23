const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    barcode: {
      type: String,
      default: '',
      index: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' }
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: 0
    },
    gstPercent: {
      type: Number,
      default: 18,
      min: 0
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0
    },
    minStockLevel: {
      type: Number,
      default: 5,
      min: 0
    },
    unit: {
      type: String,
      default: 'pcs'
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    }
  },
  { timestamps: true }
);

// Virtual to determine stock status
productSchema.virtual('stockStatus').get(function () {
  if (this.currentStock <= 0) return 'Out of Stock';
  if (this.currentStock <= this.minStockLevel) return 'Low Stock';
  return 'In Stock';
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
