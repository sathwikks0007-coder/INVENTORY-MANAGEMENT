const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');

// @desc    Get Sales Report
// @route   GET /api/reports/sales
// @access  Private (Admin, Inventory Manager)
const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, categoryId, customerId } = req.query;

    let matchQuery = {};
    if (startDate || endDate) {
      matchQuery.saleDate = {};
      if (startDate) matchQuery.saleDate.$gte = new Date(startDate);
      if (endDate) matchQuery.saleDate.$lte = new Date(endDate);
    }
    if (customerId) matchQuery.customer = customerId;

    const sales = await Sale.find(matchQuery)
      .populate('customer', 'name phone')
      .sort({ saleDate: -1 });

    let totalRevenue = 0;
    let totalDiscount = 0;
    let totalGst = 0;
    let totalItemsSold = 0;

    sales.forEach((s) => {
      totalRevenue += s.grandTotal || 0;
      totalDiscount += s.discountTotal || 0;
      totalGst += s.totalGst || 0;
      if (s.items) {
        s.items.forEach((item) => {
          totalItemsSold += item.quantity || 0;
        });
      }
    });

    res.status(200).json({
      success: true,
      summary: {
        totalSalesCount: sales.length,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalDiscount: Number(totalDiscount.toFixed(2)),
        totalGst: Number(totalGst.toFixed(2)),
        totalItemsSold
      },
      data: sales
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Purchase Report
// @route   GET /api/reports/purchases
// @access  Private (Admin, Inventory Manager)
const getPurchaseReport = async (req, res) => {
  try {
    const { startDate, endDate, supplierId } = req.query;

    let matchQuery = {};
    if (startDate || endDate) {
      matchQuery.purchaseDate = {};
      if (startDate) matchQuery.purchaseDate.$gte = new Date(startDate);
      if (endDate) matchQuery.purchaseDate.$lte = new Date(endDate);
    }
    if (supplierId) matchQuery.supplier = supplierId;

    const purchases = await Purchase.find(matchQuery)
      .populate('supplier', 'name phone email')
      .sort({ purchaseDate: -1 });

    let totalPurchaseCost = 0;
    let totalPurchaseGst = 0;

    purchases.forEach((p) => {
      totalPurchaseCost += p.grandTotal || 0;
      totalPurchaseGst += p.totalGst || 0;
    });

    res.status(200).json({
      success: true,
      summary: {
        totalPurchaseCount: purchases.length,
        totalPurchaseCost: Number(totalPurchaseCost.toFixed(2)),
        totalPurchaseGst: Number(totalPurchaseGst.toFixed(2))
      },
      data: purchases
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Inventory & Valuation Report
// @route   GET /api/reports/inventory
// @access  Private (Admin, Inventory Manager)
const getInventoryReport = async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name').lean();

    let totalItems = products.length;
    let totalStockQty = 0;
    let totalAssetValue = 0;
    let totalRetailValue = 0;
    let lowStockItems = [];
    let outOfStockItems = [];

    products.forEach((p) => {
      const qty = p.currentStock || 0;
      totalStockQty += qty;
      totalAssetValue += qty * (p.purchasePrice || 0);
      totalRetailValue += qty * (p.sellingPrice || 0);

      if (qty <= 0) {
        outOfStockItems.push(p);
      } else if (qty <= (p.minStockLevel || 5)) {
        lowStockItems.push(p);
      }
    });

    res.status(200).json({
      success: true,
      summary: {
        totalItems,
        totalStockQty,
        totalAssetValue: Number(totalAssetValue.toFixed(2)),
        totalRetailValue: Number(totalRetailValue.toFixed(2)),
        potentialProfit: Number((totalRetailValue - totalAssetValue).toFixed(2)),
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length
      },
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Profit & Revenue Analysis Report
// @route   GET /api/reports/revenue
// @access  Private (Administrator)
const getRevenueReport = async (req, res) => {
  try {
    const sales = await Sale.find().lean();
    const purchases = await Purchase.find().lean();
    const products = await Product.find().lean();

    // Map cost of goods sold (COGS)
    const productCostMap = {};
    products.forEach((p) => {
      productCostMap[p._id.toString()] = p.purchasePrice || 0;
    });

    let totalRevenue = 0;
    let totalCOGS = 0;

    sales.forEach((sale) => {
      totalRevenue += sale.taxableAmount || sale.subtotal - (sale.discountTotal || 0);
      if (sale.items) {
        sale.items.forEach((item) => {
          const unitCost = productCostMap[item.product?.toString()] || 0;
          totalCOGS += unitCost * (item.quantity || 0);
        });
      }
    });

    let totalPurchaseExpenditure = 0;
    purchases.forEach((p) => {
      totalPurchaseExpenditure += p.grandTotal || 0;
    });

    const netProfit = totalRevenue - totalCOGS;
    const profitMargin = totalRevenue > 0 ? Number(((netProfit / totalRevenue) * 100).toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalCOGS: Number(totalCOGS.toFixed(2)),
        grossProfit: Number(netProfit.toFixed(2)),
        profitMarginPercent: profitMargin,
        totalPurchaseExpenditure: Number(totalPurchaseExpenditure.toFixed(2))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getRevenueReport
};
