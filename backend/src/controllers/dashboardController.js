const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const User = require('../models/User');
const Category = require('../models/Category');

// Helper for date filter calculation
const getDateRangeFilter = (range, customStart, customEnd) => {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);

  switch (range) {
    case 'Today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'This Week':
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(start.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'This Month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'Last Month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    case 'This Year':
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    case 'Custom':
      start = customStart ? new Date(customStart) : new Date(0);
      end = customEnd ? new Date(customEnd) : new Date();
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }
  return { start, end };
};

// @desc    Get dashboard statistics cards & Recharts visualization data
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const { range = 'This Month', customStart, customEnd } = req.query;
    const { start, end } = getDateRangeFilter(range, customStart, customEnd);

    // Global Counts
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalSuppliers = await Supplier.countDocuments();
    const totalUsers = await User.countDocuments();

    // Filtered Sales & Purchases
    const salesFilter = { saleDate: { $gte: start, $lte: end } };
    const purchaseFilter = { purchaseDate: { $gte: start, $lte: end } };

    const sales = await Sale.find(salesFilter).lean();
    const purchases = await Purchase.find(purchaseFilter).lean();

    let totalSalesCount = sales.length;
    let totalRevenue = 0;
    let totalSalesGst = 0;

    sales.forEach((s) => {
      totalRevenue += s.grandTotal || 0;
      totalSalesGst += s.totalGst || 0;
    });

    let totalPurchasesCount = purchases.length;
    let totalPurchasesAmount = 0;
    purchases.forEach((p) => {
      totalPurchasesAmount += p.grandTotal || 0;
    });

    // Product stock status calculations
    const allProducts = await Product.find().populate('category', 'name').lean();
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inventoryValue = 0;

    allProducts.forEach((p) => {
      inventoryValue += (p.currentStock || 0) * (p.purchasePrice || 0);
      if (p.currentStock <= 0) outOfStockCount++;
      else if (p.currentStock <= (p.minStockLevel || 5)) lowStockCount++;
    });

    // COGS & Estimated Profit calculation
    const productCostMap = {};
    allProducts.forEach((p) => {
      productCostMap[p._id.toString()] = p.purchasePrice || 0;
    });

    let totalCOGS = 0;
    sales.forEach((sale) => {
      if (sale.items) {
        sale.items.forEach((item) => {
          const cost = productCostMap[item.product?.toString()] || 0;
          totalCOGS += cost * (item.quantity || 0);
        });
      }
    });

    const totalProfit = totalRevenue - totalSalesGst - totalCOGS;

    // --- RECHARTS DATA PREPARATION ---

    // 1. Monthly Sales & Revenue Trend (Last 6 Months or current selection)
    const monthlyTrendMap = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Seed last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyTrendMap[key] = { month: key, sales: 0, revenue: 0, purchases: 0, profit: 0 };
    }

    const allSalesForTrend = await Sale.find({
      saleDate: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
    }).lean();

    allSalesForTrend.forEach((s) => {
      const d = new Date(s.saleDate);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (monthlyTrendMap[key]) {
        monthlyTrendMap[key].sales += 1;
        monthlyTrendMap[key].revenue += s.grandTotal || 0;
      }
    });

    const allPurchasesForTrend = await Purchase.find({
      purchaseDate: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
    }).lean();

    allPurchasesForTrend.forEach((p) => {
      const d = new Date(p.purchaseDate);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (monthlyTrendMap[key]) {
        monthlyTrendMap[key].purchases += p.grandTotal || 0;
      }
    });

    const monthlyTrendData = Object.values(monthlyTrendMap);

    // 2. Sales by Category
    const categorySalesMap = {};
    sales.forEach((s) => {
      if (s.items) {
        s.items.forEach((item) => {
          const prod = allProducts.find((p) => p._id.toString() === item.product?.toString());
          const catName = prod?.category?.name || 'Uncategorized';
          categorySalesMap[catName] = (categorySalesMap[catName] || 0) + (item.lineTotal || 0);
        });
      }
    });

    const categorySalesData = Object.keys(categorySalesMap).map((name) => ({
      name,
      value: Number(categorySalesMap[name].toFixed(2))
    }));

    // 3. Top Selling Products
    const productSalesMap = {};
    sales.forEach((s) => {
      if (s.items) {
        s.items.forEach((item) => {
          const key = item.productName || item.sku;
          if (!productSalesMap[key]) {
            productSalesMap[key] = { name: key, quantity: 0, revenue: 0 };
          }
          productSalesMap[key].quantity += item.quantity || 0;
          productSalesMap[key].revenue += item.lineTotal || 0;
        });
      }
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      range,
      stats: {
        totalProducts,
        totalCustomers,
        totalSuppliers,
        totalUsers,
        totalSalesCount,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalPurchasesCount,
        totalPurchasesAmount: Number(totalPurchasesAmount.toFixed(2)),
        totalProfit: Number(totalProfit.toFixed(2)),
        inventoryValue: Number(inventoryValue.toFixed(2)),
        lowStockCount,
        outOfStockCount
      },
      charts: {
        monthlyTrendData,
        categorySalesData,
        topSellingProducts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats
};
