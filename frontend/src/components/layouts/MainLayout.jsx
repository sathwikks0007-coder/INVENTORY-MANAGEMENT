import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Users,
  Package,
  Boxes,
  Truck,
  Warehouse,
  ShoppingBag,
  BarChart3,
  UserCheck,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronDown,
  CheckCheck
} from 'lucide-react';
import Badge from '../common/Badge';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { notifications, markAsRead } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const role = user?.role || 'Store Staff';

  // Navigation Items with Role Restrictions
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Administrator', 'Inventory Manager', 'Store Staff'] },
    { label: 'POS Billing', path: '/billing', icon: ShoppingCart, roles: ['Administrator', 'Store Staff'] },
    { label: 'Sales & Orders', path: '/sales', icon: Receipt, roles: ['Administrator', 'Store Staff'] },
    { label: 'Invoices', path: '/invoices', icon: Receipt, roles: ['Administrator', 'Store Staff'] },
    { label: 'Customers', path: '/customers', icon: Users, roles: ['Administrator', 'Store Staff'] },
    { label: 'Products', path: '/products', icon: Package, roles: ['Administrator', 'Inventory Manager'] },
    { label: 'Categories', path: '/categories', icon: Boxes, roles: ['Administrator', 'Inventory Manager'] },
    { label: 'Inventory Audit', path: '/inventory', icon: Warehouse, roles: ['Administrator', 'Inventory Manager'] },
    { label: 'Purchases', path: '/purchases', icon: ShoppingBag, roles: ['Administrator', 'Inventory Manager'] },
    { label: 'Suppliers', path: '/suppliers', icon: Truck, roles: ['Administrator', 'Inventory Manager'] },
    { label: 'Analytics & Reports', path: '/reports', icon: BarChart3, roles: ['Administrator', 'Inventory Manager'] },
    { label: 'User Management', path: '/users', icon: UserCheck, roles: ['Administrator'] },
    { label: 'Company Settings', path: '/settings', icon: Settings, roles: ['Administrator'] }
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } shrink-0`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-extrabold shadow-lg shadow-indigo-500/30 text-lg">
              AP
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight tracking-tight">Apex Retail</h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Inventory ERP</p>
            </div>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Card Bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-700">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-sm font-bold text-slate-800 capitalize">
                {location.pathname.replace('/', '').replace('-', ' ') || 'Dashboard'}
              </h2>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell Badge */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 relative transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/80 py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Alerts & Notifications</h4>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => markAsRead(null)}
                        className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-medium">No new notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n._id} className="p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              n.type === 'OUT_OF_STOCK' ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                          />
                          <div className="flex-1 text-xs">
                            <p className="font-bold text-slate-800">{n.title}</p>
                            <p className="text-slate-500 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <button
                            onClick={() => markAsRead(n._id)}
                            className="text-slate-300 hover:text-slate-600 text-xs"
                          >
                            &times;
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-none">{user?.name}</p>
                  <span className="text-[10px] text-slate-400 font-medium leading-none">{user?.role}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                    <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                    <Badge type="role" status={user?.role} />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Body Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
