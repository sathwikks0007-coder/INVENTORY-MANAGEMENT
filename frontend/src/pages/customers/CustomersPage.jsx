import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Plus, Edit, Trash2, User, Phone, Mail, MapPin, Receipt, ShoppingBag } from 'lucide-react';

const CustomersPage = () => {
  const { showSuccess, showError } = useNotification();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '', gstNumber: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      let url = `/customers?page=${page}&limit=10`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      const res = await api.get(url);
      if (res.data.success) {
        setCustomers(res.data.data);
        setTotalPages(res.data.pages);
        setTotalItems(res.data.total);
      }
    } catch (err) {
      showError('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, searchTerm]);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({ name: '', phone: '', email: '', address: '', gstNumber: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      gstNumber: customer.gstNumber || ''
    });
    setIsModalOpen(true);
  };

  const handleViewProfile = async (customer) => {
    try {
      const res = await api.get(`/customers/${customer._id}`);
      if (res.data.success) {
        setProfileData(res.data.data);
      }
    } catch (err) {
      showError('Failed to load customer profile');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer._id}`, formData);
        showSuccess('Customer updated');
      } else {
        await api.post('/customers', formData);
        showSuccess('Customer created');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      showError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/customers/${deleteId}`);
      showSuccess('Customer deleted');
      setDeleteId(null);
      fetchCustomers();
    } catch (err) {
      showError(err.response?.data?.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Customer Details',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-sm shrink-0">
            {row.name?.[0] || 'C'}
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-400 font-mono">{row.phone}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Email / Address',
      render: (row) => (
        <div className="text-xs text-slate-600 space-y-0.5">
          <p>{row.email || 'N/A'}</p>
          <p className="text-slate-400 truncate max-w-xs">{row.address || 'No address'}</p>
        </div>
      )
    },
    {
      header: 'Purchases & Spent',
      render: (row) => (
        <div>
          <p className="font-bold text-emerald-600">₹{(row.totalSpent || 0).toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400">{row.purchaseCount || 0} completed orders</p>
        </div>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewProfile(row)}
            title="View Profile & Invoices"
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Customer"
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteId(row._id)}
            title="Delete Customer"
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Customer Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage customer directory and track purchasing histories</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
        onSearch={(t) => {
          setSearchTerm(t);
          setPage(1);
        }}
        searchPlaceholder="Search customer by name, phone or email..."
      />

      {/* Add / Edit Customer Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCustomer ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Customer Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number *</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl">
              {submitting ? 'Saving...' : editingCustomer ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Profile & Purchase History Modal */}
      {profileData && (
        <Modal isOpen={!!profileData} onClose={() => setProfileData(null)} title="Customer Profile & Purchase History" maxWidth="max-w-2xl">
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{profileData.customer.name}</h3>
                <p className="text-xs text-slate-500 font-mono">Phone: {profileData.customer.phone} | Email: {profileData.customer.email || 'N/A'}</p>
                <p className="text-xs text-slate-400 mt-1">GSTIN: {profileData.customer.gstNumber || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase">Total Lifetime Spending</p>
                <p className="text-2xl font-black text-emerald-600">₹{(profileData.customer.totalSpent || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Recent Invoices</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {profileData.invoices?.length === 0 ? (
                  <p className="text-xs text-slate-400">No previous invoices found</p>
                ) : (
                  profileData.invoices.map((inv) => (
                    <div key={inv._id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-indigo-600">{inv.invoiceNumber}</span>
                        <span className="text-slate-400 ml-2">{new Date(inv.invoiceDate).toLocaleDateString()}</span>
                      </div>
                      <span className="font-extrabold text-slate-900">₹{inv.grandTotal}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Customer"
        message="Are you sure you want to delete this customer?"
      />
    </div>
  );
};

export default CustomersPage;
