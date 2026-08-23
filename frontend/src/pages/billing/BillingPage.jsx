import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import BarcodeScannerModal from '../../components/pos/BarcodeScannerModal';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import {
  Search,
  Barcode,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  UserPlus,
  CreditCard,
  CheckCircle2,
  Printer,
  Download,
  AlertCircle
} from 'lucide-react';

const BillingPage = () => {
  const { showSuccess, showError, showWarning } = useNotification();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Cart & Customer state
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [flatDiscount, setFlatDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentRef, setPaymentRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals state
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });
  const [createdInvoice, setCreatedInvoice] = useState(null);

  // Fetch Categories & Customers
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [catRes, custRes] = await Promise.all([api.get('/categories'), api.get('/customers?limit=100')]);
        if (catRes.data.success) setCategories(catRes.data.data);
        if (custRes.data.success) {
          setCustomers(custRes.data.data);
          // Set default walk-in customer
          const walkIn = custRes.data.data.find((c) => c.phone === '0000000000') || custRes.data.data[0];
          if (walkIn) setSelectedCustomer(walkIn);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchInitial();
  }, []);

  // Fetch Products with filters
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      let url = `/products?limit=50&status=Active`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm]);

  // Barcode / SKU Direct Lookup
  const handleBarcodeScan = async (code) => {
    try {
      const res = await api.get(`/products/barcode/${encodeURIComponent(code)}`);
      if (res.data.success && res.data.data) {
        addToCart(res.data.data);
        showSuccess(`Added '${res.data.data.name}' to cart`);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Product not found with this Barcode/SKU');
    }
  };

  // Add Item to Cart
  const addToCart = (product) => {
    if (product.currentStock <= 0) {
      showError(`'${product.name}' is Out of Stock!`);
      return;
    }

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((item) => item.product._id === product._id);

      if (existingIdx > -1) {
        const item = prevCart[existingIdx];
        if (item.quantity + 1 > product.currentStock) {
          showWarning(`Cannot add more. Max stock available: ${product.currentStock}`);
          return prevCart;
        }
        const updated = [...prevCart];
        updated[existingIdx] = {
          ...item,
          quantity: item.quantity + 1
        };
        return updated;
      }

      return [
        ...prevCart,
        {
          product,
          quantity: 1,
          unitPrice: product.sellingPrice,
          gstPercent: product.gstPercent || 18,
          discount: 0
        }
      ];
    });
  };

  // Update Cart Quantity
  const updateQuantity = (productId, newQty) => {
    const item = cart.find((i) => i.product._id === productId);
    if (!item) return;

    if (newQty > item.product.currentStock) {
      showWarning(`Stock limit reached (${item.product.currentStock} units available)`);
      return;
    }

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((i) => (i.product._id === productId ? { ...i, quantity: newQty } : i))
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((i) => i.product._id !== productId));
  };

  // Calculations
  const calculateCartTotals = () => {
    let subtotal = 0;
    let itemDiscounts = 0;
    let totalGst = 0;

    cart.forEach((item) => {
      const itemSub = item.unitPrice * item.quantity;
      const taxable = Math.max(0, itemSub - (item.discount || 0));
      const gst = (taxable * (item.gstPercent || 0)) / 100;

      subtotal += itemSub;
      itemDiscounts += Number(item.discount || 0);
      totalGst += gst;
    });

    const totalDiscount = itemDiscounts + Number(flatDiscount || 0);
    const taxableAmount = Math.max(0, subtotal - totalDiscount);
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    const grandTotal = taxableAmount + totalGst;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      discountTotal: Number(totalDiscount.toFixed(2)),
      taxableAmount: Number(taxableAmount.toFixed(2)),
      cgst: Number(cgst.toFixed(2)),
      sgst: Number(sgst.toFixed(2)),
      totalGst: Number(totalGst.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2))
    };
  };

  const totals = calculateCartTotals();

  // Create Quick Customer
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/customers', newCustomer);
      if (res.data.success) {
        showSuccess('Customer created successfully');
        setCustomers((prev) => [res.data.data, ...prev]);
        setSelectedCustomer(res.data.data);
        setIsAddCustomerOpen(false);
        setNewCustomer({ name: '', phone: '', email: '', address: '' });
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create customer');
    }
  };

  // Complete Sale
  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      showError('Cart is empty. Please add products to complete sale.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerId: selectedCustomer?._id,
        items: cart.map((i) => ({
          product: i.product._id,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          gstPercent: i.gstPercent,
          discount: i.discount
        })),
        flatDiscount: Number(flatDiscount) || 0,
        paymentMethod,
        paymentRef
      };

      const res = await api.post('/sales', payload);
      if (res.data.success) {
        showSuccess('Sale completed & invoice generated!');
        setCreatedInvoice(res.data.data);
        setCart([]);
        setFlatDiscount(0);
        fetchProducts(); // Refresh products stock
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Sale failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger PDF Download
  const handleDownloadPDF = async (invoiceId, invoiceNumber) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      showError('Failed to download invoice PDF');
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
      {/* Left Side: Catalog & Search (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col h-full bg-white rounded-3xl border border-slate-200/80 p-5 overflow-hidden shadow-sm">
        {/* Search & Barcode Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-4 shrink-0">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product name, SKU, or barcode..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => setIsBarcodeOpen(true)}
            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-sm transition-colors flex items-center gap-2 border border-indigo-200/60"
          >
            <Barcode className="w-4 h-4" />
            <span>Scan Barcode</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 border-b border-slate-100 shrink-0">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === '' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat._id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {loadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
              No products found
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4">
              {products.map((p) => {
                const isOutOfStock = p.currentStock <= 0;
                return (
                  <div
                    key={p._id}
                    onClick={() => !isOutOfStock && addToCart(p)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isOutOfStock
                        ? 'opacity-50 bg-slate-50 border-slate-200 cursor-not-allowed'
                        : 'bg-white border-slate-200/80 hover:border-indigo-500 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                          {p.sku}
                        </span>
                        <Badge type="stock" status={p.stockStatus} />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-2">{p.name}</h4>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-50 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-extrabold text-slate-900">₹{p.sellingPrice}</span>
                        <span className="text-[10px] text-slate-400 block">Stock: {p.currentStock} {p.unit}</span>
                      </div>
                      <button
                        disabled={isOutOfStock}
                        className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Cart & Checkout (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col h-full bg-white rounded-3xl border border-slate-200/80 p-5 overflow-hidden shadow-sm">
        {/* Customer Selector Header */}
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 flex-1 mr-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Customer:</label>
            <select
              value={selectedCustomer?._id || ''}
              onChange={(e) => {
                const c = customers.find((cust) => cust._id === e.target.value);
                setSelectedCustomer(c);
              }}
              className="flex-1 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl p-2 focus:outline-none"
            >
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsAddCustomerOpen(true)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
            title="Add New Customer"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Item Table */}
        <div className="flex-1 overflow-y-auto my-3 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <ShoppingCart className="w-12 h-12 stroke-1 mb-2 opacity-40" />
              <p className="text-sm font-medium">Cart is empty</p>
              <p className="text-xs text-slate-400 mt-1">Scan barcode or select products to start billing</p>
            </div>
          ) : (
            cart.map((item) => {
              const lineTotal = (item.unitPrice * item.quantity - (item.discount || 0)) * (1 + item.gstPercent / 100);

              return (
                <div key={item.product._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.product.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>₹{item.unitPrice}</span>
                      <span>•</span>
                      <span>GST {item.gstPercent}%</span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                      className="p-1 hover:bg-white text-slate-600 rounded-lg transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-extrabold text-slate-800 px-1.5">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      className="p-1 hover:bg-white text-slate-600 rounded-lg transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900 block">₹{lineTotal.toFixed(2)}</span>
                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="text-rose-500 hover:text-rose-700 text-[10px] font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Totals & Checkout Panel */}
        <div className="pt-3 border-t border-slate-100 space-y-3 shrink-0 bg-slate-50/50 p-4 rounded-2xl">
          {/* Bill Breakdown */}
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Flat Discount (₹)</span>
              <input
                type="number"
                min="0"
                value={flatDiscount}
                onChange={(e) => setFlatDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-20 px-2 py-0.5 text-right bg-white border border-slate-200 rounded-lg text-xs font-bold"
              />
            </div>
            <div className="flex justify-between">
              <span>Taxable Amount</span>
              <span className="font-semibold text-slate-900">₹{totals.taxableAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>CGST (half) + SGST (half)</span>
              <span>₹{totals.totalGst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Grand Total</span>
              <span className="text-indigo-600">₹{totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-4 gap-1.5 pt-2">
            {['Cash', 'UPI', 'Credit Card', 'Debit Card'].map((pm) => (
              <button
                key={pm}
                type="button"
                onClick={() => setPaymentMethod(pm)}
                className={`py-2 rounded-xl text-[11px] font-bold border transition-all ${
                  paymentMethod === pm
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {pm}
              </button>
            ))}
          </div>

          {/* Checkout Action Button */}
          <button
            onClick={handleCompleteSale}
            disabled={isSubmitting || cart.length === 0}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Processing Order...' : `Complete Sale • ₹${totals.grandTotal.toFixed(2)}`}
          </button>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeOpen}
        onClose={() => setIsBarcodeOpen(false)}
        onScanSuccess={handleBarcodeScan}
      />

      {/* Quick Add Customer Modal */}
      <Modal isOpen={isAddCustomerOpen} onClose={() => setIsAddCustomerOpen(false)} title="Quick Add Customer">
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Customer Name *</label>
            <input
              type="text"
              required
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number *</label>
            <input
              type="text"
              required
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              placeholder="e.g. 9876543210"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsAddCustomerOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl"
            >
              Save Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Sale Success & Invoice Modal */}
      {createdInvoice && (
        <Modal isOpen={!!createdInvoice} onClose={() => setCreatedInvoice(null)} title="Sale Completed Successfully!">
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Invoice #{createdInvoice.invoiceNumber}</h3>
              <p className="text-xs text-slate-500 mt-1">Customer: {createdInvoice.customerName}</p>
              <p className="text-2xl font-black text-emerald-600 mt-2">
                ₹{Number(createdInvoice.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => handleDownloadPDF(createdInvoice.invoiceId, createdInvoice.invoiceNumber)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" /> Download PDF Invoice
              </button>
              <button
                onClick={() => setCreatedInvoice(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                New Billing
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BillingPage;
