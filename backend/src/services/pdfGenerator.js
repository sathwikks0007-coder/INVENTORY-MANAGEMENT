const PDFDocument = require('pdfkit');

function generateInvoicePDF(invoice, companySettings, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });

  // Stream PDF to HTTP response
  doc.pipe(res);

  const primaryColor = '#1E3A8A'; // Navy Blue
  const secondaryColor = '#475569'; // Slate Gray
  const accentColor = '#059669'; // Emerald Green

  // Header / Title Banner
  doc
    .fillColor(primaryColor)
    .fontSize(24)
    .font('Helvetica-Bold')
    .text(companySettings.companyName || 'Apex Retail ERP', 40, 40);

  doc
    .fillColor(secondaryColor)
    .fontSize(9)
    .font('Helvetica')
    .text(companySettings.address || '', 40, 68)
    .text(`Phone: ${companySettings.phone || ''} | Email: ${companySettings.email || ''}`, 40, 80)
    .text(`GSTIN: ${companySettings.gstNumber || 'N/A'}`, 40, 92);

  // Right Aligned Invoice Title & Meta
  doc
    .fillColor(primaryColor)
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('TAX INVOICE', 380, 40, { align: 'right' });

  doc
    .fillColor(secondaryColor)
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(`Invoice No: ${invoice.invoiceNumber}`, 380, 68, { align: 'right' })
    .font('Helvetica')
    .text(`Date: ${new Date(invoice.invoiceDate || Date.now()).toLocaleDateString('en-IN')}`, 380, 84, { align: 'right' })
    .text(`Payment Status: ${invoice.paymentStatus.toUpperCase()}`, 380, 100, { align: 'right' });

  // Divider Line
  doc
    .moveTo(40, 118)
    .lineTo(555, 118)
    .strokeColor('#CBD5E1')
    .lineWidth(1)
    .stroke();

  // Customer Information Box
  doc
    .rect(40, 128, 515, 65)
    .fillAndStroke('#F8FAFC', '#E2E8F0');

  const customer = invoice.customerDetails || {};
  doc
    .fillColor(primaryColor)
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('BILLED TO:', 50, 136);

  doc
    .fillColor('#1E293B')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(customer.name || 'Walk-in Customer', 50, 150)
    .font('Helvetica')
    .fillColor(secondaryColor)
    .text(`Phone: ${customer.phone || 'N/A'} | Email: ${customer.email || 'N/A'}`, 50, 164)
    .text(`Address: ${customer.address || 'N/A'} | GSTIN: ${customer.gstNumber || 'N/A'}`, 50, 178);

  // Items Table Header
  const tableTop = 205;
  doc
    .rect(40, tableTop, 515, 22)
    .fill(primaryColor);

  doc
    .fillColor('#FFFFFF')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('#', 45, tableTop + 6)
    .text('Item Description', 65, tableTop + 6)
    .text('SKU', 230, tableTop + 6)
    .text('Qty', 310, tableTop + 6, { width: 30, align: 'right' })
    .text('Rate (₹)', 350, tableTop + 6, { width: 55, align: 'right' })
    .text('GST %', 415, tableTop + 6, { width: 40, align: 'right' })
    .text('Amount (₹)', 465, tableTop + 6, { width: 85, align: 'right' });

  let y = tableTop + 24;
  let itemIndex = 1;

  // Table Body Rows
  invoice.items.forEach((item) => {
    // Alternating row color
    if (itemIndex % 2 === 0) {
      doc.rect(40, y, 515, 20).fill('#F8FAFC');
    }

    doc
      .fillColor('#334155')
      .fontSize(9)
      .font('Helvetica')
      .text(itemIndex.toString(), 45, y + 5)
      .text(item.productName || 'Product', 65, y + 5, { width: 160, ellipsis: true })
      .text(item.sku || '-', 230, y + 5, { width: 75, ellipsis: true })
      .text(item.quantity.toString(), 310, y + 5, { width: 30, align: 'right' })
      .text(Number(item.unitPrice).toFixed(2), 350, y + 5, { width: 55, align: 'right' })
      .text(`${item.gstPercent}%`, 415, y + 5, { width: 40, align: 'right' })
      .text(Number(item.lineTotal).toFixed(2), 465, y + 5, { width: 85, align: 'right' });

    y += 20;
    itemIndex++;
  });

  // Table Bottom Border
  doc.moveTo(40, y).lineTo(555, y).strokeColor('#CBD5E1').stroke();
  y += 10;

  // Totals Section (Right Aligned)
  const totalsX = 350;
  const totalsWidth = 205;

  const drawSummaryRow = (label, value, isBold = false) => {
    doc
      .fillColor(isBold ? primaryColor : secondaryColor)
      .fontSize(isBold ? 11 : 9)
      .font(isBold ? 'Helvetica-Bold' : 'Helvetica')
      .text(label, totalsX, y, { width: 110, align: 'left' })
      .text(`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, totalsX + 110, y, {
        width: 95,
        align: 'right'
      });
    y += 16;
  };

  drawSummaryRow('Subtotal:', invoice.subtotal || 0);
  if (invoice.discount > 0) drawSummaryRow('Discount:', -invoice.discount);
  drawSummaryRow('Taxable Amount:', invoice.taxableAmount || 0);
  drawSummaryRow('CGST:', invoice.cgst || 0);
  drawSummaryRow('SGST:', invoice.sgst || 0);
  drawSummaryRow('Total GST:', invoice.totalGst || 0);

  doc.moveTo(totalsX, y - 4).lineTo(555, y - 4).strokeColor(primaryColor).lineWidth(1.5).stroke();
  drawSummaryRow('Grand Total:', invoice.grandTotal || 0, true);

  // Footer Section
  const footerY = 750;
  doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor('#E2E8F0').lineWidth(1).stroke();

  doc
    .fillColor(accentColor)
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Thank you for your business!', 40, footerY + 10, { align: 'center' });

  doc
    .fillColor(secondaryColor)
    .fontSize(8)
    .font('Helvetica')
    .text('Computer Generated Invoice • No Signature Required', 40, footerY + 24, { align: 'center' });

  doc.end();
}

module.exports = { generateInvoicePDF };
