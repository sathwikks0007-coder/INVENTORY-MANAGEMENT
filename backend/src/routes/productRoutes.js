const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getProducts, getProductById, getProductByBarcode, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Configure Multer storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename(req, file, cb) {
    cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter(req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Images only (jpg, jpeg, png, webp)'));
  }
});

router.use(protect);

router.get('/barcode/:barcode', getProductByBarcode);

router
  .route('/')
  .get(getProducts)
  .post(authorizeRoles('Administrator', 'Inventory Manager'), upload.single('image'), createProduct);

router
  .route('/:id')
  .get(getProductById)
  .put(authorizeRoles('Administrator', 'Inventory Manager'), upload.single('image'), updateProduct)
  .delete(authorizeRoles('Administrator', 'Inventory Manager'), deleteProduct);

module.exports = router;
