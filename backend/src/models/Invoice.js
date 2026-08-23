const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale',
      required: true
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    invoiceDate: {
      type: Date,
      default: Date.now
    },
    customerDetails: {
      name: String,
      phone: String,
      email: String,
      address: String,
      gstNumber: String
    },
    companyDetails: {
      companyName: String,
      address: String,
      phone: String,
      email: String,
      gstNumber: String,
      logo: String
    },
    items: [
      {
        productName: String,
        sku: String,
        quantity: Number,
        unitPrice: Number,
        gstPercent: Number,
        gstAmount: Number,
        discount: Number,
        lineTotal: Number
      }
    ],
    subtotal: Number,
    discount: Number,
    taxableAmount: Number,
    cgst: Number,
    sgst: Number,
    totalGst: Number,
    grandTotal: Number,
    paymentMethod: String,
    paymentStatus: String,
    pdfUrl: { type: String, default: '' },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
