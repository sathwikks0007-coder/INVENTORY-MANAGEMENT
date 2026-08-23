import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { ArrowLeft, Printer, Download, Mail, CheckCircle } from 'lucide-react';

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotification();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        // Find sale or invoice by ID
        const res = await api.get(`/sales/${id}`);
        if (res.data.success) {
          setInvoice(res.data.data.invoice || res.data.data.sale);
        }
      } catch (err) {
        // Try direct invoice fetch
        try {
          const directRes = await api.get(`/invoices/${id}`);
          if (directRes.data.success) {
            setInvoice(directRes.data.data);
          }
        } catch (e) {
          showError('Failed to load invoice details');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/invoices/${invoice._id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      showError('Failed to download PDF invoice');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading Tax Invoice...</div>;
  }

  if (!invoice) {
    return <div className="p-8 text-center text-rose-500 font-bold">Invoice Not Found</div>;
  }

  const company = invoice.companyDetails || {};
  const customer = invoice.customerDetails || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Header (hidden in print) */}
      <div className="flex items-center justify-between no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sales
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div id="printable-invoice" className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200/80 shadow-lg space-y-8 font-sans">
        {/* Company Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-100 pb-8">
          <div>
            <h1 className="text-2xl font-black text-indigo-900 tracking-tight">{company.companyName || 'Apex Retail ERP'}</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">{company.address || '123 Business Park, Bengaluru, KA'}</p>
            <p className="text-xs text-slate-500 mt-1">Phone: {company.phone || 'N/A'} | Email: {company.email || 'N/A'}</p>
            <p className="text-xs font-bold text-slate-700 mt-1">GSTIN: {company.gstNumber || '29ABCDE1234F1Z5'}</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-full uppercase tracking-wider">
              TAX INVOICE
            </span>
            <h2 className="text-xl font-mono font-black text-slate-900 mt-3">{invoice.invoiceNumber}</h2>
            <p className="text-xs text-slate-500 mt-1">
              Date: {new Date(invoice.invoiceDate || Date.now()).toLocaleDateString('en-IN')}
            </p>
            <p className="text-xs font-bold text-emerald-600 mt-1">
              Status: {(invoice.paymentStatus || 'PAID').toUpperCase()} ({invoice.paymentMethod || 'Cash'})
            </p>
          </div>
        </div>

        {/* Customer Information Box */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">BILLED TO:</p>
          <h3 className="text-base font-bold text-slate-900">{customer.name || 'Walk-In Customer'}</h3>
          <p className="text-xs text-slate-600 mt-1">Phone: {customer.phone || 'N/A'} | Email: {customer.email || 'N/A'}</p>
          {customer.address && <p className="text-xs text-slate-500 mt-0.5">Address: {customer.address}</p>}
          {customer.gstNumber && <p className="text-xs font-bold text-slate-700 mt-0.5">GSTIN: {customer.gstNumber}</p>}
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase font-bold">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Item Description</th>
                <th className="p-3">SKU</th>
                <th className="p-3 text-right">Qty</th>
                <th className="p-3 text-right">Rate (₹)</th>
                <th className="p-3 text-right">GST %</th>
                <th className="p-3 text-right">Line Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items?.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-400 font-bold">{idx + 1}</td>
                  <td className="p-3 font-bold text-slate-900">{item.productName || item.name || 'Product'}</td>
                  <td className="p-3 text-slate-500 font-mono">{item.sku || '-'}</td>
                  <td className="p-3 text-right font-bold text-slate-900">{item.quantity}</td>
                  <td className="p-3 text-right text-slate-700">₹{Number(item.unitPrice).toFixed(2)}</td>
                  <td className="p-3 text-right text-slate-700">{item.gstPercent}%</td>
                  <td className="p-3 text-right font-bold text-slate-900">₹{Number(item.lineTotal || item.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Totals Breakdown */}
        <div className="flex flex-col sm:flex-row justify-end pt-4 border-t border-slate-100">
          <div className="w-full sm:w-80 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">₹{Number(invoice.subtotal || 0).toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Discount:</span>
                <span>-₹{Number(invoice.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Taxable Amount:</span>
              <span className="font-semibold text-slate-900">₹{Number(invoice.taxableAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>CGST (Central Tax):</span>
              <span>₹{Number(invoice.cgst || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>SGST (State Tax):</span>
              <span>₹{Number(invoice.sgst || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-800">
              <span>Total GST:</span>
              <span>₹{Number(invoice.totalGst || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-indigo-900 pt-3 border-t-2 border-slate-900">
              <span>Grand Total:</span>
              <span>₹{Number(invoice.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-slate-100 text-center space-y-1">
          <p className="text-xs font-bold text-emerald-600">Thank you for your business!</p>
          <p className="text-[10px] text-slate-400">Computer Generated Invoice • Authorized Apex Retail ERP</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;
