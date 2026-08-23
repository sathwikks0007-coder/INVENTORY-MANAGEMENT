const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(getCategories)
  .post(authorizeRoles('Administrator', 'Inventory Manager'), createCategory);

router
  .route('/:id')
  .put(authorizeRoles('Administrator', 'Inventory Manager'), updateCategory)
  .delete(authorizeRoles('Administrator', 'Inventory Manager'), deleteCategory);

module.exports = router;
