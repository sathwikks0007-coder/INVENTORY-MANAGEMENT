const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true
    },
    email: {
      type: String,
      default: '',
      lowercase: true,
      trim: true
    },
    address: {
      type: String,
      default: ''
    },
    gstNumber: {
      type: String,
      default: '',
      uppercase: true,
      trim: true
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    purchaseCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
