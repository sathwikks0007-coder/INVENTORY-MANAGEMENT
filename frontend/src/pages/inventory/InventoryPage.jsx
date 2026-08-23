import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { Warehouse, AlertTriangle, History, Package, IndianRupee, Layers } from 'lucide-react';

const InventoryPage = () => {
  const { showError } = useNotification();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'logs'
  const [inventoryData, setInventoryData] = useState([]);
  const [stats, setStats] = useState({ totalItems: 0, totalInventoryValue: 0, lowStockCount: 0, outOfStockCount: 0 });
  const [logsData, setLogsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      if (activeTab === 'inventory') {
        let url = `/inventory?page=${page}&limit=10`;
        if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
        const res = await api.get(url);
        if (res.data.success) {
          setInventoryData(res.data.data);
          setStats(res.data.stats);
          setTotalPages(res.data.pagination.pages);
          setTotalItems(res.data.pagination.total);
        }
      } else {
        const res = await api.get(`/inventory/logs?page=${page}&limit=15`);
        if (res.data.success) {
          setLogsData(res.data.data);
          setTotalPages(res.data.pages);
          setTotalItems(res.data.total);
        }
      }
    } catch (err) {
      showError('Failed to load inventory details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [activeTab, page, searchTerm]);

  const inventoryColumns = [
    {
      header: 'Product / SKU',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.name}</p>
          <p className="text-xs font-mono text-slate-400">SKU: {row.sku} | Barcode: {row.barcode || 'N/A'}</p>
        </div>
      )
    },
    {
      header: 'Category',
      render: (row) => <span className="font-medium text-slate-700">{row.category?.name || 'N/A'}</span>
    },
    {
      header: 'Current Stock',
      render: (row) => (
        <div>
          <span className="text-sm font-extrabold text-slate-900">{row.currentStock} {row.unit}</span>
          <span className="text-[11px] text-slate-400 block">Min Level: {row.minStockLevel}</span>
        </div>
      )
    },
    {
      header: 'Stock Valuation (₹)',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">₹{((row.currentStock || 0) * (row.purchasePrice || 0)).toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400">Rate: ₹{row.purchasePrice}/unit</p>
        </div>
      )
    },
    {
      header: 'Stock Status',
      render: (row) => <Badge type="stock" status={row.stockStatus} />
    }
  ];

  const logColumns = [
    {
      header: 'Date & Time',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{new Date(row.date || row.createdAt).toLocaleDateString('en-IN')}</p>
          <p className="text-[11px] text-slate-400">{new Date(row.date || row.createdAt).toLocaleTimeString()}</p>
        </div>
      )
    },
    {
      header: 'Product',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.product?.name || 'Deleted Product'}</p>
          <p className="text-[11px] font-mono text-slate-400">SKU: {row.product?.sku || 'N/A'}</p>
        </div>
      )
    },
    {
      header: 'Transaction Type',
      render: (row) => {
        let badgeColor = 'bg-slate-100 text-slate-700';
        if (row.transactionType === 'PURCHASE') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (row.transactionType === 'SALE') badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';

        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
            {row.transactionType}
          </span>
        );
      }
    },
    {
      header: 'Stock Movement',
      render: (row) => (
        <div>
          <span className={`font-extrabold text-sm ${row.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
          </span>
          <p className="text-[11px] text-slate-400">Prev: {row.previousStock} &rarr; New: {row.newStock}</p>
        </div>
      )
    },
    {
      header: 'Logged By',
      render: (row) => <span className="font-medium text-slate-700">{row.user?.name || 'System'}</span>
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Inventory & Stock Audit</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time stock valuation, low-stock warnings, and audit logs</p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveTab('inventory');
              setPage(1);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Warehouse className="w-4 h-4 text-indigo-600" /> Stock Audit Table
          </button>
          <button
            onClick={() => {
              setActiveTab('logs');
              setPage(1);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'logs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-emerald-600" /> Movement Logs
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Stock Items"
          value={stats.totalItems || 0}
          icon={Package}
          color="indigo"
        />
        <StatCard
          title="Total Asset Valuation"
          value={`₹${(stats.totalInventoryValue || 0).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          color="emerald"
          subtext="Purchase cost valuation"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockCount || 0}
          icon={AlertTriangle}
          color="amber"
          subtext="Below reorder point"
        />
        <StatCard
          title="Out of Stock Items"
          value={stats.outOfStockCount || 0}
          icon={AlertTriangle}
          color="rose"
          subtext="Requires restock"
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={activeTab === 'inventory' ? inventoryColumns : logColumns}
        data={activeTab === 'inventory' ? inventoryData : logsData}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
        onSearch={
          activeTab === 'inventory'
            ? (t) => {
                setSearchTerm(t);
                setPage(1);
              }
            : null
        }
        searchPlaceholder="Search product by name or SKU..."
      />
    </div>
  );
};

export default InventoryPage;
