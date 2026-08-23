const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const { calculateInvoiceTotals } = require('../services/gstCalculator');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get purchases list with pagination & filters
// @route   GET /api/purchases
// @access  Private (Admin, Inventory Manager)
const getPurchases = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const { supplier, paymentStatus, startDate, endDate, search } = req.query;

    let query = {};
    if (supplier) query.supplier = supplier;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (search) {
      query.invoiceNumber = { $regex: search, $options: 'i' };
    }

    if (startDate || endDate) {
      query.purchaseDate = {};
      if (startDate) query.purchaseDate.$gte = new Date(startDate);
      if (endDate) query.purchaseDate.$lte = new Date(endDate);
    }

    const purchases = await Purchase.find(query)
      .populate('supplier', 'name phone email gstNumber')
      .populate('createdBy', 'name')
      .sort({ purchaseDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Purchase.countDocuments(query);

    res.status(200).json({
      success: true,
      count: purchases.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: purchases
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get purchase details by ID
// @route   GET /api/purchases/:id
// @access  Private (Admin, Inventory Manager)
const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplier', 'name contactPerson phone email gstNumber address')
      .populate('items.product', 'name sku barcode unit')
      .populate('createdBy', 'name email');

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase record not found' });
    }

    res.status(200).json({ success: true, data: purchase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record a new purchase & increase inventory stock
// @route   POST /api/purchases
// @access  Private (Admin, Inventory Manager)
const createPurchase = async (req, res) => {
  try {
    const { supplier, invoiceNumber, purchaseDate, items, totalDiscount, paymentStatus, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Purchase must contain at least one product.' });
    }

    // Backend Totals Calculation
    const invoiceTotals = calculateInvoiceTotals(items, totalDiscount || 0);

    // Create Purchase Record
    const purchase = await Purchase.create({
      supplier,
      invoiceNumber,
      purchaseDate: purchaseDate || Date.now(),
      items: invoiceTotals.items.map((i) => ({
        product: i.product,
        quantity: i.quantity,
        purchasePrice: i.purchasePrice,
        gstPercent: i.gstPercent,
        gstAmount: i.gstAmount,
        total: i.lineTotal
      })),
      subtotal: invoiceTotals.subtotal,
      totalGst: invoiceTotals.totalGst,
      totalDiscount: invoiceTotals.discountTotal,
      grandTotal: invoiceTotals.grandTotal,
      paymentStatus: paymentStatus || 'Paid',
      notes: notes || '',
      createdBy: req.user._id
    });

    // Update Product Stock & Create InventoryLog records atomically
    for (const item of invoiceTotals.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const previousStock = product.currentStock;
        const newStock = previousStock + item.quantity;

        product.currentStock = newStock;
        // Optionally update purchase price to latest
        if (item.purchasePrice > 0) {
          product.purchasePrice = item.purchasePrice;
        }
        await product.save();

        await InventoryLog.create({
          product: product._id,
          transactionType: 'PURCHASE',
          quantity: item.quantity,
          previousStock,
          newStock,
          referenceId: purchase._id,
          referenceType: 'Purchase',
          user: req.user._id,
          date: Date.now(),
          notes: `Stock increased via Purchase Inv #${invoiceNumber}`
        });
      }
    }

    await logAudit(
      req.user,
      'CREATE_PURCHASE',
      'Purchase',
      purchase._id.toString(),
      `Recorded Purchase Inv #${invoiceNumber} for ₹${invoiceTotals.grandTotal}`
    );

    const populated = await Purchase.findById(purchase._id)
      .populate('supplier', 'name phone')
      .populate('items.product', 'name sku');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPurchases,
  getPurchaseById,
  createPurchase
};
