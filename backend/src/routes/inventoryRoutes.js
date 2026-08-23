const express = require('express');
const router = express.Router();
const {
  getInventory,
  getLowStockProducts,
  getInventoryLogs,
  getNotifications,
  markNotificationsRead
} = require('../controllers/inventoryController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/low-stock', getLowStockProducts);
router.get('/notifications', getNotifications);
router.put('/notifications/read', markNotificationsRead);

router.get('/', authorizeRoles('Administrator', 'Inventory Manager'), getInventory);
router.get('/logs', authorizeRoles('Administrator', 'Inventory Manager'), getInventoryLogs);

module.exports = router;
