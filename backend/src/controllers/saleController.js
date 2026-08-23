const Sale = require('../models/Sale');
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const InventoryLog = require('../models/InventoryLog');
const Notification = require('../models/Notification');
const CompanySettings = require('../models/CompanySettings');
const { calculateInvoiceTotals } = require('../services/gstCalculator');
const { logAudit } = require('../utils/auditLogger');

// Helper to generate unique invoice number
const generateInvoiceNumber = async () => {
  let settings = await CompanySettings.findOne();
  if (!settings) {
    settings = await CompanySettings.create({});
  }

  const prefix = settings.invoicePrefix || 'INV-2026-';
  const count = await Invoice.countDocuments();
  const nextSeq = (count + 1).toString().padStart(6, '0');
  const invoiceNumber = `${prefix}${nextSeq}`;

  // Double check uniqueness
  const exists = await Invoice.findOne({ invoiceNumber });
  if (exists) {
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}${nextSeq}-${timestamp}`;
  }
  return invoiceNumber;
};

// @desc    Get sales list with pagination & search
// @route   GET /api/sales
// @access  Private
const getSales = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const { customer, paymentMethod, paymentStatus, startDate, endDate, search } = req.query;

    let query = {};
    if (customer) query.customer = customer;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (search) {
      query.invoiceNumber = { $regex: search, $options: 'i' };
    }

    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) query.saleDate.$lte = new Date(endDate);
    }

    const sales = await Sale.find(query)
      .populate('customer', 'name phone email gstNumber')
      .populate('createdBy', 'name')
      .sort({ saleDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Sale.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sales.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: sales
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single sale by ID
// @route   GET /api/sales/:id
// @access  Private
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'name phone email address gstNumber')
      .populate('items.product', 'name sku barcode unit')
      .populate('createdBy', 'name email');

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale transaction not found' });
    }

    const invoice = await Invoice.findOne({ sale: sale._id });

    res.status(200).json({
      success: true,
      data: {
        sale,
        invoice
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new Sale & Invoice (POS / Billing)
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res) => {
  try {
    const { customerId, customerData, items, flatDiscount, paymentMethod, paymentRef, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty. Add at least one item to complete sale.' });
    }

    // 1. Resolve or Create Customer
    let customerObj;
    if (customerId) {
      customerObj = await Customer.findById(customerId);
    } else if (customerData && customerData.name && customerData.phone) {
      let existingCustomer = await Customer.findOne({ phone: customerData.phone.trim() });
      if (existingCustomer) {
        customerObj = existingCustomer;
      } else {
        customerObj = await Customer.create({
          name: customerData.name,
          phone: customerData.phone.trim(),
          email: customerData.email || '',
          address: customerData.address || '',
          gstNumber: customerData.gstNumber || ''
        });
      }
    }

    if (!customerObj) {
      // Default Walk-In Customer
      let walkIn = await Customer.findOne({ phone: '0000000000' });
      if (!walkIn) {
        walkIn = await Customer.create({
          name: 'Walk-In Customer',
          phone: '0000000000',
          email: 'walkin@retail.com'
        });
      }
      customerObj = walkIn;
    }

    // 2. Validate Stock Availability & Prepare Line Items
    const preparedItems = [];
    const stockUpdateQueue = [];

    for (const item of items) {
      const product = await Product.findById(item.product || item._id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found (ID: ${item.product || item._id})` });
      }

      const qtyRequested = Number(item.quantity) || 1;
      if (product.currentStock < qtyRequested) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${product.name}'. Only ${product.currentStock} units available.`
        });
      }

      preparedItems.push({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        quantity: qtyRequested,
        unitPrice: Number(item.unitPrice || product.sellingPrice),
        gstPercent: Number(product.gstPercent || 18),
        discount: Number(item.discount || 0)
      });

      stockUpdateQueue.push({ product, qtyRequested });
    }

    // 3. Backend GST & Totals Calculation
    const invoiceTotals = calculateInvoiceTotals(preparedItems, flatDiscount || 0);
    const invoiceNumber = await generateInvoiceNumber();

    // 4. Create Sale Record
    const sale = await Sale.create({
      customer: customerObj._id,
      saleDate: Date.now(),
      invoiceNumber,
      items: invoiceTotals.items.map((i) => ({
        product: i.product,
        productName: i.productName,
        sku: i.sku,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        gstPercent: i.gstPercent,
        gstAmount: i.gstAmount,
        discount: i.discount,
        lineTotal: i.lineTotal
      })),
      subtotal: invoiceTotals.subtotal,
      discountTotal: invoiceTotals.discountTotal,
      taxableAmount: invoiceTotals.taxableAmount,
      cgst: invoiceTotals.cgst,
      sgst: invoiceTotals.sgst,
      totalGst: invoiceTotals.totalGst,
      grandTotal: invoiceTotals.grandTotal,
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: 'Paid',
      paymentRef: paymentRef || '',
      notes: notes || '',
      createdBy: req.user._id
    });

    // 5. Fetch Company Settings
    let companySettings = await CompanySettings.findOne();
    if (!companySettings) {
      companySettings = await CompanySettings.create({});
    }

    // 6. Create Invoice Record
    const invoice = await Invoice.create({
      sale: sale._id,
      invoiceNumber,
      invoiceDate: sale.saleDate,
      customerDetails: {
        name: customerObj.name,
        phone: customerObj.phone,
        email: customerObj.email,
        address: customerObj.address,
        gstNumber: customerObj.gstNumber
      },
      companyDetails: {
        companyName: companySettings.companyName,
        address: companySettings.address,
        phone: companySettings.phone,
        email: companySettings.email,
        gstNumber: companySettings.gstNumber,
        logo: companySettings.logo
      },
      items: sale.items,
      subtotal: sale.subtotal,
      discount: sale.discountTotal,
      taxableAmount: sale.taxableAmount,
      cgst: sale.cgst,
      sgst: sale.sgst,
      totalGst: sale.totalGst,
      grandTotal: sale.grandTotal,
      paymentMethod: sale.paymentMethod,
      paymentStatus: sale.paymentStatus,
      createdBy: req.user._id
    });

    // 7. Update Inventory Stock & Log Stock Deduction
    for (const { product, qtyRequested } of stockUpdateQueue) {
      const previousStock = product.currentStock;
      const newStock = previousStock - qtyRequested;

      product.currentStock = newStock;
      await product.save();

      await InventoryLog.create({
        product: product._id,
        transactionType: 'SALE',
        quantity: -qtyRequested,
        previousStock,
        newStock,
        referenceId: sale._id,
        referenceType: 'Sale',
        user: req.user._id,
        date: Date.now(),
        notes: `Stock reduced via Sale Inv #${invoiceNumber}`
      });

      // Low Stock / Out of Stock Notification Trigger
      if (newStock === 0) {
        await Notification.create({
          title: 'Out of Stock Alert',
          message: `'${product.name}' (SKU: ${product.sku}) is now out of stock!`,
          type: 'OUT_OF_STOCK',
          product: product._id
        });
      } else if (newStock <= product.minStockLevel) {
        await Notification.create({
          title: 'Low Stock Alert',
          message: `'${product.name}' is low in stock. Only ${newStock} units remaining.`,
          type: 'LOW_STOCK',
          product: product._id
        });
      }
    }

    // 8. Update Customer Purchase Metrics
    customerObj.totalSpent += invoiceTotals.grandTotal;
    customerObj.purchaseCount += 1;
    await customerObj.save();

    await logAudit(
      req.user,
      'CREATE_SALE',
      'Sale',
      sale._id.toString(),
      `Completed Sale Inv #${invoiceNumber} for ₹${invoiceTotals.grandTotal}`
    );

    res.status(201).json({
      success: true,
      message: 'Sale completed & invoice generated successfully',
      data: {
        saleId: sale._id,
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        grandTotal: invoice.grandTotal,
        paymentStatus: invoice.paymentStatus,
        customerName: customerObj.name
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSales,
  getSaleById,
  createSale
};
