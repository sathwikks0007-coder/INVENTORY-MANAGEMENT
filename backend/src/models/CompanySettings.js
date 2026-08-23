const mongoose = require('mongoose');

const companySettingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: 'Apex Retail ERP'
    },
    logo: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: '123 Business Avenue, Suite 400, Tech Park, Bangalore, KA - 560001'
    },
    phone: {
      type: String,
      default: '+91 98765 43210'
    },
    email: {
      type: String,
      default: 'contact@apexretail.com'
    },
    gstNumber: {
      type: String,
      default: '29ABCDE1234F1Z5'
    },
    invoicePrefix: {
      type: String,
      default: 'INV-2026-'
    },
    currency: {
      type: String,
      default: '₹'
    },
    defaultGstPercent: {
      type: Number,
      default: 18
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CompanySettings', companySettingsSchema);
