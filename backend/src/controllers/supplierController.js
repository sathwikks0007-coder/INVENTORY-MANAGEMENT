const Supplier = require('../models/Supplier');
const Purchase = require('../models/Purchase');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get suppliers with search & pagination
// @route   GET /api/suppliers
// @access  Private (Admin, Inventory Manager)
const getSuppliers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { gstNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const suppliers = await Supplier.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Supplier.countDocuments(query);

    res.status(200).json({
      success: true,
      count: suppliers.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: suppliers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get supplier profile & purchase history
// @route   GET /api/suppliers/:id
// @access  Private (Admin, Inventory Manager)
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const purchases = await Purchase.find({ supplier: req.params.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        supplier,
        purchases
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private (Admin, Inventory Manager)
const createSupplier = async (req, res) => {
  try {
    const { name, contactPerson, phone, email, gstNumber, address, status } = req.body;

    const supplier = await Supplier.create({
      name,
      contactPerson: contactPerson || '',
      phone,
      email: email || '',
      gstNumber: gstNumber || '',
      address: address || '',
      status: status || 'Active'
    });

    await logAudit(req.user, 'CREATE_SUPPLIER', 'Supplier', supplier._id.toString(), `Created supplier: ${name}`);

    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Admin, Inventory Manager)
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    await logAudit(req.user, 'UPDATE_SUPPLIER', 'Supplier', supplier._id.toString(), `Updated supplier: ${supplier.name}`);

    res.status(200).json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Admin, Inventory Manager)
const deleteSupplier = async (req, res) => {
  try {
    const purchaseCount = await Purchase.countDocuments({ supplier: req.params.id });
    if (purchaseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete supplier. ${purchaseCount} purchase transactions exist for this supplier.`
      });
    }

    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    await logAudit(req.user, 'DELETE_SUPPLIER', 'Supplier', req.params.id, `Deleted supplier: ${supplier.name}`);

    res.status(200).json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
