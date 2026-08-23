import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Receipt, Eye, Download, Mail, Printer, CheckCircle } from 'lucide-react';

const SalesPage = () => {
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  // Email modal
  const [emailModalInvoice, setEmailModalInvoice] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const fetchSales = async () => {
    setLoading(true);
    try {
      let url = `/sales?page=${page}&limit=10`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (paymentStatusFilter) url += `&paymentStatus=${paymentStatusFilter}`;

      const res = await api.get(url);
      if (res.data.success) {
        setSales(res.data.data);
        setTotalPages(res.data.pages);
        setTotalItems(res.data.total);
      }
    } catch (err) {
      showError('Failed to fetch sales records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, searchTerm, paymentStatusFilter]);

  const handleDownloadPDF = async (invoiceNumber) => {
    try {
      // Lookup invoice ID from sale
      const invRes = await api.get(`/invoices?search=${invoiceNumber}`);
      if (invRes.data.success && invRes.data.data.length > 0) {
        const invId = invRes.data.data[0]._id;
        const pdfRes = await api.get(`/invoices/${invId}/pdf`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${invoiceNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      showError('Failed to download PDF invoice');
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailInput || !emailModalInvoice) return;
    setSendingEmail(true);
    try {
      const invRes = await api.get(`/invoices?search=${emailModalInvoice.invoiceNumber}`);
      if (invRes.data.success && invRes.data.data.length > 0) {
        const invId = invRes.data.data[0]._id;
        const res = await api.post(`/invoices/${invId}/email`, { email: emailInput });
        showSuccess(res.data.message);
        setEmailModalInvoice(null);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to email invoice');
    } finally {
      setSendingEmail(false);
    }
  };

  const columns = [
    {
      header: 'Invoice No. / Date',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <p className="font-mono font-bold text-indigo-600">{row.invoiceNumber}</p>
            <p className="text-xs text-slate-400">{new Date(row.saleDate).toLocaleDateString('en-IN')}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Customer',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.customer?.name || 'Walk-In Customer'}</p>
          <p className="text-xs text-slate-400 font-mono">{row.customer?.phone || 'N/A'}</p>
        </div>
      )
    },
    {
      header: 'Payment Method',
      render: (row) => <span className="font-semibold text-slate-700">{row.paymentMethod}</span>
    },
    {
      header: 'Grand Total (₹)',
      render: (row) => (
        <div>
          <p className="font-extrabold text-slate-900 text-sm">₹{(row.grandTotal || 0).toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400">Subtotal: ₹{row.subtotal} | Tax: ₹{row.totalGst}</p>
        </div>
      )
    },
    {
      header: 'Payment Status',
      render: (row) => <Badge type="payment" status={row.paymentStatus} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/invoices/${row._id}`)}
            title="View Invoice Detail"
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDownloadPDF(row.invoiceNumber)}
            title="Download PDF"
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEmailModalInvoice(row);
              setEmailInput(row.customer?.email || '');
            }}
            title="Email Invoice"
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <Mail className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Sales & Invoices</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track complete store sales transactions, payments, and generated invoices</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={sales}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
        onSearch={(t) => {
          setSearchTerm(t);
          setPage(1);
        }}
        searchPlaceholder="Search by invoice number or customer name..."
        filterComponent={
          <select
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        }
      />

      {/* Email Modal */}
      {emailModalInvoice && (
        <Modal isOpen={!!emailModalInvoice} onClose={() => setEmailModalInvoice(null)} title="Email Tax Invoice">
          <form onSubmit={handleSendEmail} className="space-y-4">
            <p className="text-xs text-slate-500">
              Send PDF invoice copy for <span className="font-bold text-slate-800">#{emailModalInvoice.invoiceNumber}</span> to customer.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Customer Email Address *</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="customer@example.com"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEmailModalInvoice(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingEmail}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5" />
                {sendingEmail ? 'Sending...' : 'Send Invoice Email'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SalesPage;
