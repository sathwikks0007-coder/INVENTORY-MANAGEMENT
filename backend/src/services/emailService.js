const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && !process.env.EMAIL_USER.includes('example.com')) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  return null;
};

const sendInvoiceEmail = async (toEmail, invoice, companyName = 'Apex Retail ERP') => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log(`[Email Service Simulation]: Email would be sent to ${toEmail} for Invoice #${invoice.invoiceNumber}`);
      return { success: true, simulated: true };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"${companyName}" <no-reply@apexretail.com>`,
      to: toEmail,
      subject: `Invoice #${invoice.invoiceNumber} from ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #1e3a8a; color: #ffffff; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">${companyName}</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Tax Invoice Notification</p>
          </div>
          <div style="padding: 24px; color: #334155;">
            <p>Dear Valued Customer,</p>
            <p>Thank you for your purchase! Below are the summary details of your invoice:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Invoice Number:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${invoice.invoiceNumber}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Date:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${new Date(invoice.invoiceDate).toLocaleDateString()}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Total Amount:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">₹${Number(invoice.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Payment Status:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${invoice.paymentStatus}</td></tr>
            </table>
            <p>You can download your full PDF invoice directly from your customer portal or reply to this email for any billing inquiries.</p>
            <p style="margin-top: 24px;">Warm regards,<br/><strong>${companyName} Team</strong></p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Sent]: MessageID ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Sending Error]: ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = { sendInvoiceEmail };
