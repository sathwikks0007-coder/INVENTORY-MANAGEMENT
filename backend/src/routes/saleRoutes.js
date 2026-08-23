const express = require('express');
const router = express.Router();
const { getSales, getSaleById, createSale } = require('../controllers/saleController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(getSales)
  .post(createSale);

router.get('/:id', getSaleById);

module.exports = router;
