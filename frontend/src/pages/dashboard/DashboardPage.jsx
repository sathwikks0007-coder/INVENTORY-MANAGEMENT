import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import {
  IndianRupee,
  TrendingUp,
  ShoppingCart,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  Boxes,
  PlusCircle,
  Receipt,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

const DashboardPage = () => {
  const { user } = useAuth();
  const [range, setRange] = useState('This Month');
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState({ monthlyTrendData: [], categorySalesData: [], topSellingProducts: [] });
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/dashboard/stats?range=${range}`);
      if (res.data.success) {
        setStats(res.data.stats);
        setCharts(res.data.charts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [range]);

  const role = user?.role || 'Store Staff';

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 md:p-8 rounded-3xl text-white shadow-xl">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">
            {role} Portal
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-1">Welcome back, {user?.name}!</h1>
          <p className="text-sm text-slate-300 mt-1">Here is your store's live financial and stock overview.</p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 self-start md:self-auto">
          <Calendar className="w-4 h-4 text-indigo-300 ml-2" />
          {['Today', 'This Week', 'This Month', 'Last Month', 'This Year'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                range === r ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/billing"
          className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm flex items-center justify-between shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5" />
            <span>Open POS Billing</span>
          </div>
          <span>&rarr;</span>
        </Link>
        {(role === 'Administrator' || role === 'Inventory Manager') && (
          <>
            <Link
              to="/products"
              className="p-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 rounded-2xl font-bold text-sm flex items-center justify-between shadow-xs transition-all transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                <span>Add Product</span>
              </div>
              <span>&rarr;</span>
            </Link>
            <Link
              to="/purchases"
              className="p-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 rounded-2xl font-bold text-sm flex items-center justify-between shadow-xs transition-all transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <span>Record Purchase</span>
              </div>
              <span>&rarr;</span>
            </Link>
          </>
        )}
        <Link
          to="/sales"
          className="p-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 rounded-2xl font-bold text-sm flex items-center justify-between shadow-xs transition-all transform hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-amber-600" />
            <span>Sales History</span>
          </div>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={`Total Revenue (${range})`}
          value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          color="emerald"
          subtext={`${stats?.totalSalesCount || 0} completed orders`}
        />
        {role === 'Administrator' && (
          <StatCard
            title={`Est. Profit (${range})`}
            value={`₹${(stats?.totalProfit || 0).toLocaleString('en-IN')}`}
            icon={TrendingUp}
            color="indigo"
            subtext="After COGS and tax deduction"
          />
        )}
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={Package}
          color="blue"
          subtext={`Inventory Value: ₹${(stats?.inventoryValue || 0).toLocaleString('en-IN')}`}
        />
        <StatCard
          title="Stock Alerts"
          value={`${stats?.lowStockCount || 0} Low / ${stats?.outOfStockCount || 0} Out`}
          icon={AlertTriangle}
          color={stats?.outOfStockCount > 0 ? 'rose' : 'amber'}
          subtext="Requires reordering"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Revenue & Purchases Trend</h3>
              <p className="text-xs text-slate-500">6-Month historical financial breakdown</p>
            </div>
          </div>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyTrendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPur" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                />
                <Legend />
                <Area type="monotone" dataKey="revenue" name="Sales Revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                <Area type="monotone" dataKey="purchases" name="Purchases Cost" stroke="#10b981" fillOpacity={1} fill="url(#colorPur)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Sales by Category</h3>
            <p className="text-xs text-slate-500">Revenue breakdown by product categories</p>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            {charts.categorySalesData.length === 0 ? (
              <p className="text-xs text-slate-400">No category sales recorded yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.categorySalesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {charts.categorySalesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top Selling Products Bar Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Top Selling Products</h3>
          <p className="text-xs text-slate-500">Most popular products by units sold</p>
        </div>
        <div className="h-64 w-full">
          {charts.topSellingProducts.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">No sales recorded yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.topSellingProducts} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={150} />
                <Tooltip
                  formatter={(val, name) => [name === 'quantity' ? `${val} units` : `₹${Number(val).toLocaleString('en-IN')}`, name === 'quantity' ? 'Units Sold' : 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="quantity" name="Units Sold" fill="#6366f1" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
