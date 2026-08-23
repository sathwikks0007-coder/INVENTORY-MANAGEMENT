const Invoice = require('../models/Invoice');
const CompanySettings = require('../models/CompanySettings');
const { generateInvoicePDF } = require('../services/pdfGenerator');
const { sendInvoiceEmail } = require('../services/emailService');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get invoices list
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const { search, paymentStatus, startDate, endDate } = req.query;

    let query = {};
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customerDetails.name': { $regex: search, $options: 'i' } },
        { 'customerDetails.phone': { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) query.invoiceDate.$gte = new Date(startDate);
      if (endDate) query.invoiceDate.$lte = new Date(endDate);
    }

    const invoices = await Invoice.find(query)
      .sort({ invoiceDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Invoice.countDocuments(query);

    res.status(200).json({
      success: true,
      count: invoices.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: invoices
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get invoice detail JSON
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('createdBy', 'name');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download / Stream PDF invoice
// @route   GET /api/invoices/:id/pdf
// @access  Private
const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    let companySettings = await CompanySettings.findOne();
    if (!companySettings) {
      companySettings = { companyName: 'Apex Retail ERP', address: '', phone: '', email: '', gstNumber: '' };
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`);

    generateInvoicePDF(invoice, companySettings, res);

    await logAudit(req.user, 'DOWNLOAD_INVOICE_PDF', 'Invoice', invoice._id.toString(), `Downloaded PDF for Inv #${invoice.invoiceNumber}`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send PDF invoice via email to customer
// @route   POST /api/invoices/:id/email
// @access  Private
const emailInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const email = req.body.email || invoice.customerDetails.email;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Customer email address is required' });
    }

    let companySettings = await CompanySettings.findOne();
    const companyName = companySettings ? companySettings.companyName : 'Apex Retail ERP';

    const result = await sendInvoiceEmail(email, invoice, companyName);

    await logAudit(req.user, 'EMAIL_INVOICE', 'Invoice', invoice._id.toString(), `Emailed Inv #${invoice.invoiceNumber} to ${email}`);

    res.status(200).json({
      success: true,
      message: `Invoice #${invoice.invoiceNumber} sent successfully to ${email}`,
      simulated: result.simulated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  downloadInvoicePDF,
  emailInvoice
};
