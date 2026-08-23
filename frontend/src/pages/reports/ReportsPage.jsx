import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import StatCard from '../../components/common/StatCard';
import { BarChart3, TrendingUp, IndianRupee, Download, Calendar, ShoppingBag, Package } from 'lucide-react';

const ReportsPage = () => {
  const { showError, showSuccess } = useNotification();
  const [activeReport, setActiveReport] = useState('sales'); // 'sales' | 'purchases' | 'inventory' | 'revenue'
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = `/reports/${activeReport}?`;
      if (startDate) url += `startDate=${startDate}&`;
      if (endDate) url += `endDate=${endDate}&`;

      const res = await api.get(url);
      if (res.data.success) {
        setReportData(res.data);
      }
    } catch (err) {
      showError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeReport, startDate, endDate]);

  const exportCSV = () => {
    if (!reportData || !reportData.data) return;
    const items = reportData.data;
    if (items.length === 0) return;

    const keys = Object.keys(items[0]).filter((k) => typeof items[0][k] !== 'object');
    let csv = keys.join(',') + '\n';
    items.forEach((row) => {
      csv += keys.map((k) => `"${row[k] || ''}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeReport}-report-${Date.now()}.csv`;
    a.click();
    showSuccess('CSV report downloaded successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Business Analytics & Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">Generate sales, purchase, stock valuation, and tax reports</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent font-medium focus:outline-none"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent font-medium focus:outline-none"
            />
          </div>

          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { key: 'sales', label: 'Sales Reports' },
          { key: 'purchases', label: 'Purchase Reports' },
          { key: 'inventory', label: 'Inventory Valuation' },
          { key: 'revenue', label: 'Profit & Revenue Analysis' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveReport(tab.key)}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap ${
              activeReport === tab.key
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 animate-pulse">Generating Report...</div>
      ) : (
        <div className="space-y-6">
          {/* Sales Report Summary */}
          {activeReport === 'sales' && reportData?.summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Sales Revenue"
                value={`₹${reportData.summary.totalRevenue.toLocaleString('en-IN')}`}
                icon={IndianRupee}
                color="emerald"
                subtext={`${reportData.summary.totalSalesCount} transactions`}
              />
              <StatCard
                title="GST Collected"
                value={`₹${reportData.summary.totalGst.toLocaleString('en-IN')}`}
                icon={BarChart3}
                color="indigo"
              />
              <StatCard
                title="Total Discounts"
                value={`₹${reportData.summary.totalDiscount.toLocaleString('en-IN')}`}
                icon={TrendingUp}
                color="amber"
              />
              <StatCard
                title="Items Sold"
                value={reportData.summary.totalItemsSold}
                icon={Package}
                color="blue"
              />
            </div>
          )}

          {/* Purchase Report Summary */}
          {activeReport === 'purchases' && reportData?.summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Total Purchase Cost"
                value={`₹${reportData.summary.totalPurchaseCost.toLocaleString('en-IN')}`}
                icon={ShoppingBag}
                color="indigo"
                subtext={`${reportData.summary.totalPurchaseCount} purchase orders`}
              />
              <StatCard
                title="Purchase GST Paid"
                value={`₹${reportData.summary.totalPurchaseGst.toLocaleString('en-IN')}`}
                icon={BarChart3}
                color="amber"
              />
            </div>
          )}

          {/* Inventory Valuation Summary */}
          {activeReport === 'inventory' && reportData?.summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Asset Cost Valuation"
                value={`₹${reportData.summary.totalAssetValue.toLocaleString('en-IN')}`}
                icon={IndianRupee}
                color="indigo"
              />
              <StatCard
                title="Retail Value"
                value={`₹${reportData.summary.totalRetailValue.toLocaleString('en-IN')}`}
                icon={IndianRupee}
                color="emerald"
              />
              <StatCard
                title="Potential Gross Margin"
                value={`₹${reportData.summary.potentialProfit.toLocaleString('en-IN')}`}
                icon={TrendingUp}
                color="blue"
              />
              <StatCard
                title="Stock Alert Count"
                value={`${reportData.summary.lowStockCount} Low / ${reportData.summary.outOfStockCount} Out`}
                icon={Package}
                color="rose"
              />
            </div>
          )}

          {/* Revenue & Profit Summary */}
          {activeReport === 'revenue' && reportData?.data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Revenue"
                value={`₹${reportData.data.totalRevenue.toLocaleString('en-IN')}`}
                icon={IndianRupee}
                color="emerald"
              />
              <StatCard
                title="Cost of Goods Sold (COGS)"
                value={`₹${reportData.data.totalCOGS.toLocaleString('en-IN')}`}
                icon={ShoppingBag}
                color="amber"
              />
              <StatCard
                title="Gross Profit"
                value={`₹${reportData.data.grossProfit.toLocaleString('en-IN')}`}
                icon={TrendingUp}
                color="indigo"
              />
              <StatCard
                title="Profit Margin"
                value={`${reportData.data.profitMarginPercent}%`}
                icon={BarChart3}
                color="blue"
              />
            </div>
          )}

          {/* Data Table */}
          {reportData?.data && Array.isArray(reportData.data) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3 capitalize">{activeReport} Data Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead className="bg-slate-50 uppercase font-bold text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="p-3">Reference / Name</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.data.slice(0, 20).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">
                          {row.invoiceNumber || row.name || row.productName || 'Record'}
                        </td>
                        <td className="p-3 text-slate-400">
                          {row.saleDate || row.purchaseDate ? new Date(row.saleDate || row.purchaseDate).toLocaleDateString('en-IN') : 'N/A'}
                        </td>
                        <td className="p-3 text-right font-extrabold text-slate-900">
                          ₹{Number(row.grandTotal || row.sellingPrice || row.totalAssetValue || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
