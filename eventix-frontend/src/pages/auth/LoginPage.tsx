import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Users } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, getDefaultRedirectForRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login({ email, password });
      const from = (location.state as any)?.from?.pathname;
      const target = from || getDefaultRedirectForRole(user.roles[0]);
      navigate(target, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra email và mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (roleEmail: string, rolePass: string = 'password123') => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div>
      <div className="mb-5 text-center">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Đăng nhập tài khoản</h2>
        <p className="text-xs text-slate-500 mt-1">Truy cập hệ thống săn vé và quản lý EventiX</p>
      </div>

      {isExpired && (
        <div className="mb-4 p-2.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 min-w-4 text-amber-600" />
          Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.
        </div>
      )}

      {error && (
        <div className="mb-4 p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 min-w-4 text-rose-600" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-8 pr-3 py-2 rounded-md bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Mật khẩu
            </label>
            <a href="#" className="text-xs text-indigo-600 hover:text-indigo-700">
              Quên mật khẩu?
            </a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-8 pr-3 py-2 rounded-md bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5" />
              Đăng nhập
            </>
          )}
        </button>
      </form>

      {/* Demo account quick fill */}
      <div className="mt-5 pt-4 border-t border-slate-200">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center flex items-center justify-center gap-1.5">
          <Users className="w-3 h-3 text-slate-400" />
          Tài khoản kiểm thử phân quyền Role
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => fillDemoAccount('admin@eventix.com')}
            className="p-2 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-slate-700 transition-colors cursor-pointer"
          >
            <span className="font-semibold text-indigo-700 block text-xs">Admin</span>
            <span className="text-[10px] text-slate-400 truncate block">admin@eventix.com</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('organizer@eventix.com')}
            className="p-2 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-slate-700 transition-colors cursor-pointer"
          >
            <span className="font-semibold text-slate-800 block text-xs">Organizer</span>
            <span className="text-[10px] text-slate-400 truncate block">organizer@eventix.com</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('staff@eventix.com')}
            className="p-2 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-slate-700 transition-colors cursor-pointer"
          >
            <span className="font-semibold text-emerald-700 block text-xs">Gate Staff</span>
            <span className="text-[10px] text-slate-400 truncate block">staff@eventix.com</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('user@eventix.com')}
            className="p-2 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-slate-700 transition-colors cursor-pointer"
          >
            <span className="font-semibold text-slate-800 block text-xs">Khách hàng</span>
            <span className="text-[10px] text-slate-400 truncate block">user@eventix.com</span>
          </button>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-slate-500">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
          Đăng ký tài khoản
        </Link>
      </div>
    </div>
  );
};
