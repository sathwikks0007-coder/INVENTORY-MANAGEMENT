const express = require('express');
const router = express.Router();
const { getPurchases, getPurchaseById, createPurchase } = require('../controllers/purchaseController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorizeRoles('Administrator', 'Inventory Manager'));

router
  .route('/')
  .get(getPurchases)
  .post(createPurchase);

router.get('/:id', getPurchaseById);

module.exports = router;
