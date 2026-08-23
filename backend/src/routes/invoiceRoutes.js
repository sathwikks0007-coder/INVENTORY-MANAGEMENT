const express = require('express');
const router = express.Router();
const { getInvoices, getInvoiceById, downloadInvoicePDF, emailInvoice } = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.get('/:id/pdf', downloadInvoicePDF);
router.post('/:id/email', emailInvoice);

module.exports = router;
