import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ShieldCheck, ArrowRight, Lock, Mail, Store, Package, FileText, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      showSuccess(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      showError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-slate-800/20">
        {/* Left Side Banner */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-xl border border-white/20 shadow-inner text-indigo-300">
                AP
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">Apex Retail</h1>
                <p className="text-xs uppercase font-bold tracking-widest text-indigo-300">Inventory & Billing ERP</p>
              </div>
            </div>

            <h2 className="text-2xl lg:text-3xl font-extrabold leading-tight text-white mb-4">
              Complete ERP Solution for Retail & Small Business
            </h2>
            <p className="text-sm text-indigo-200/90 leading-relaxed mb-8">
              Streamline stock management, POS billing, GST tax compliance, automated PDF invoices, and real-time business reports.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs font-semibold text-indigo-100 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-xs">
                <Store className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Fast POS Billing & Barcode Scanning</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-indigo-100 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-xs">
                <Package className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real-Time Inventory Stock Audit & Alerts</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-indigo-100 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-xs">
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Instant PDF Invoices & Nodemailer Integration</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10 text-[11px] text-indigo-300 flex items-center justify-between">
            <span>© 2026 Apex Retail ERP</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secure JWT Auth
            </span>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to Your Account</h2>
              <p className="text-sm text-slate-500 mt-1">Enter credentials to access your ERP workspace</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@erp.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to System</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Login Credentials */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Quick Demo Credentials:
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('admin@erp.com', 'Admin@123')}
                  className="px-2.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg transition-colors border border-indigo-200/60"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('manager@erp.com', 'Manager@123')}
                  className="px-2.5 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-[11px] font-bold rounded-lg transition-colors border border-cyan-200/60"
                >
                  Manager
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('staff@erp.com', 'Staff@123')}
                  className="px-2.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold rounded-lg transition-colors border border-purple-200/60"
                >
                  Store Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
