const Product = require('../models/Product');
const Category = require('../models/Category');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get products with search, filter, pagination
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search, category, stockStatus, minPrice, maxPrice, status } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (minPrice || maxPrice) {
      query.sellingPrice = {};
      if (minPrice) query.sellingPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.sellingPrice.$lte = parseFloat(maxPrice);
    }

    let products = await Product.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Apply stock status filter if provided (since virtual stockStatus is dynamic)
    if (stockStatus) {
      products = products.filter((p) => p.stockStatus === stockStatus);
    }

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get product by Barcode
// @route   GET /api/products/barcode/:barcode
// @access  Private
const getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const product = await Product.findOne({
      $or: [{ barcode: barcode.trim() }, { sku: barcode.trim().toUpperCase() }]
    }).populate('category', 'name');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found with this Barcode/SKU' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private (Admin, Inventory Manager)
const createProduct = async (req, res) => {
  try {
    const { name, sku, barcode, category, description, purchasePrice, sellingPrice, gstPercent, currentStock, minStockLevel, unit, status } = req.body;

    const skuExists = await Product.findOne({ sku: sku.toUpperCase() });
    if (skuExists) {
      return res.status(400).json({ success: false, message: 'A product with this SKU already exists.' });
    }

    if (barcode) {
      const barcodeExists = await Product.findOne({ barcode: barcode.trim() });
      if (barcodeExists) {
        return res.status(400).json({ success: false, message: 'A product with this barcode already exists.' });
      }
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = req.file.path || `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    const product = await Product.create({
      name,
      sku: sku.toUpperCase(),
      barcode: barcode || '',
      category,
      description,
      image: { url: imageUrl, public_id: '' },
      purchasePrice,
      sellingPrice,
      gstPercent: gstPercent || 18,
      currentStock: currentStock || 0,
      minStockLevel: minStockLevel || 5,
      unit: unit || 'pcs',
      status: status || 'Active'
    });

    await logAudit(req.user, 'CREATE_PRODUCT', 'Product', product._id.toString(), `Created product: ${name} (${sku})`);

    const populated = await Product.findById(product._id).populate('category', 'name');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin, Inventory Manager)
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.body.sku && req.body.sku.toUpperCase() !== product.sku) {
      const skuExists = await Product.findOne({ sku: req.body.sku.toUpperCase() });
      if (skuExists) {
        return res.status(400).json({ success: false, message: 'This SKU is already in use by another product.' });
      }
      req.body.sku = req.body.sku.toUpperCase();
    }

    if (req.body.barcode && req.body.barcode !== product.barcode) {
      const barcodeExists = await Product.findOne({ barcode: req.body.barcode });
      if (barcodeExists) {
        return res.status(400).json({ success: false, message: 'This barcode is already in use by another product.' });
      }
    }

    if (req.file) {
      req.body.image = { url: req.file.path || `/uploads/${req.file.filename}`, public_id: '' };
    } else if (req.body.imageUrl) {
      req.body.image = { url: req.body.imageUrl, public_id: '' };
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('category', 'name');

    await logAudit(req.user, 'UPDATE_PRODUCT', 'Product', product._id.toString(), `Updated product: ${product.name}`);

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin, Inventory Manager)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    await logAudit(req.user, 'DELETE_PRODUCT', 'Product', req.params.id, `Deleted product: ${product.name}`);

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct
};
