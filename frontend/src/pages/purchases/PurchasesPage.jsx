import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { Plus, ShoppingBag, Trash2, Calendar, FileText } from 'lucide-react';

const PurchasesPage = () => {
  const { showSuccess, showError } = useNotification();
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [supplierId, setSupplierId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [items, setItems] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [notes, setNotes] = useState('');

  const fetchInitialData = async () => {
    try {
      const [supRes, prodRes] = await Promise.all([api.get('/suppliers?limit=100'), api.get('/products?limit=200')]);
      if (supRes.data.success) {
        setSuppliers(supRes.data.data);
        if (supRes.data.data.length > 0) setSupplierId(supRes.data.data[0]._id);
      }
      if (prodRes.data.success) setProducts(prodRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/purchases?page=${page}&limit=10`);
      if (res.data.success) {
        setPurchases(res.data.data);
        setTotalPages(res.data.pages);
        setTotalItems(res.data.total);
      }
    } catch (err) {
      showError('Failed to fetch purchases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [page]);

  const handleOpenAdd = () => {
    setInvoiceNumber(`SUP-INV-${Math.floor(1000 + Math.random() * 9000)}`);
    setItems([{ product: products[0]?._id || '', quantity: 10, purchasePrice: products[0]?.purchasePrice || 0, gstPercent: products[0]?.gstPercent || 18 }]);
    setPaymentStatus('Paid');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleAddItemRow = () => {
    const firstProd = products[0];
    setItems([
      ...items,
      {
        product: firstProd?._id || '',
        quantity: 1,
        purchasePrice: firstProd?.purchasePrice || 0,
        gstPercent: firstProd?.gstPercent || 18
      }
    ]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'product') {
      const selectedP = products.find((p) => p._id === value);
      if (selectedP) {
        updated[index].purchasePrice = selectedP.purchasePrice || 0;
        updated[index].gstPercent = selectedP.gstPercent || 18;
      }
    }
    setItems(updated);
  };

  const handleRemoveItemRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      showError('Please add at least one product to purchase order');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        supplier: supplierId,
        invoiceNumber,
        items,
        paymentStatus,
        notes
      };

      const res = await api.post('/purchases', payload);
      if (res.data.success) {
        showSuccess('Purchase recorded & stock updated!');
        setIsModalOpen(false);
        fetchPurchases();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to record purchase');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Invoice / Date',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.invoiceNumber}</p>
            <p className="text-xs text-slate-400">{new Date(row.purchaseDate).toLocaleDateString('en-IN')}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Supplier',
      render: (row) => <span className="font-semibold text-slate-800">{row.supplier?.name || 'N/A'}</span>
    },
    {
      header: 'Total Cost (₹)',
      render: (row) => (
        <div>
          <p className="font-extrabold text-slate-900">₹{(row.grandTotal || 0).toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400">Subtotal: ₹{row.subtotal} | GST: ₹{row.totalGst}</p>
        </div>
      )
    },
    {
      header: 'Payment Status',
      render: (row) => <Badge type="payment" status={row.paymentStatus} />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Purchase Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">Record wholesale inventory restocking & track supplier purchases</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Record New Purchase
        </button>
      </div>

      <DataTable
        columns={columns}
        data={purchases}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
      />

      {/* Record Purchase Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Inventory Purchase" maxWidth="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Select Supplier *</label>
              <select
                required
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
              >
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.phone})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Supplier Invoice / Ref No. *</label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Purchase Items</h4>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                  <select
                    value={item.product}
                    onChange={(e) => handleItemChange(idx, 'product', e.target.value)}
                    className="flex-1 p-2 bg-white border border-slate-200 rounded-lg font-medium"
                  >
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                    className="w-20 p-2 bg-white border border-slate-200 rounded-lg text-center font-bold"
                  />

                  <input
                    type="number"
                    step="0.01"
                    placeholder="Cost (₹)"
                    value={item.purchasePrice}
                    onChange={(e) => handleItemChange(idx, 'purchasePrice', Number(e.target.value))}
                    className="w-24 p-2 bg-white border border-slate-200 rounded-lg text-right font-bold"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveItemRow(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partially Paid">Partially Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                placeholder="Optional notes..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl">
              {submitting ? 'Recording...' : 'Record Purchase & Update Stock'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PurchasesPage;
