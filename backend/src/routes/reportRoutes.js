const express = require('express');
const router = express.Router();
const {
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getRevenueReport
} = require('../controllers/reportController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/sales', authorizeRoles('Administrator', 'Inventory Manager'), getSalesReport);
router.get('/purchases', authorizeRoles('Administrator', 'Inventory Manager'), getPurchaseReport);
router.get('/inventory', authorizeRoles('Administrator', 'Inventory Manager'), getInventoryReport);
router.get('/revenue', authorizeRoles('Administrator'), getRevenueReport);

module.exports = router;
