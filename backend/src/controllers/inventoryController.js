const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const Notification = require('../models/Notification');

// @desc    Get Inventory Overview & Stock table
// @route   GET /api/inventory
// @access  Private (Admin, Inventory Manager)
const getInventory = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const { search, stockStatus, category } = req.query;

    let query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ currentStock: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    // Compute Overall Statistics from entire DB
    const allProducts = await Product.find().lean();
    const totalItems = allProducts.length;
    let totalInventoryValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    allProducts.forEach((p) => {
      totalInventoryValue += (p.currentStock || 0) * (p.purchasePrice || 0);
      if (p.currentStock <= 0) {
        outOfStockCount++;
      } else if (p.currentStock <= (p.minStockLevel || 5)) {
        lowStockCount++;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalItems,
        totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
        lowStockCount,
        outOfStockCount
      },
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Low Stock items
// @route   GET /api/inventory/low-stock
// @access  Private
const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ $expr: { $lte: ['$currentStock', '$minStockLevel'] } })
      .populate('category', 'name')
      .sort({ currentStock: 1 });

    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Stock Audit Logs
// @route   GET /api/inventory/logs
// @access  Private (Admin, Inventory Manager)
const getInventoryLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;
    const { transactionType, product } = req.query;

    let query = {};
    if (transactionType) query.transactionType = transactionType;
    if (product) query.product = product;

    const logs = await InventoryLog.find(query)
      .populate('product', 'name sku currentStock')
      .populate('user', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InventoryLog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Notifications
// @route   GET /api/inventory/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ readBy: { $ne: req.user._id } })
      .populate('product', 'name sku currentStock')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark Notification(s) as Read
// @route   PUT /api/inventory/notifications/read
// @access  Private
const markNotificationsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;
    if (notificationId) {
      await Notification.findByIdAndUpdate(notificationId, { $addToSet: { readBy: req.user._id } });
    } else {
      // Mark all read for this user
      await Notification.updateMany({}, { $addToSet: { readBy: req.user._id } });
    }
    res.status(200).json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getInventory,
  getLowStockProducts,
  getInventoryLogs,
  getNotifications,
  markNotificationsRead
};
