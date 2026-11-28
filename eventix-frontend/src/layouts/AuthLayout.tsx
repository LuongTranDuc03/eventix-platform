import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-center items-center p-4">
      {/* Header Brand */}
      <div className="mb-6 flex flex-col items-center">
        <Link to="/" className="flex items-center gap-2 group mb-1.5">
          <div className="w-9 h-9 rounded-md bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Ticket className="w-5 h-5 transform -rotate-12" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            Eventi<span className="text-indigo-600">X</span>
          </span>
        </Link>
        <p className="text-xs text-slate-500 font-medium">Nền tảng phân phối vé sự kiện & concert chịu tải cao</p>
      </div>

      {/* Clean Card container */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-sm p-6 sm:p-8">
        <Outlet />
      </div>

      {/* Bottom link */}
      <div className="mt-5">
        <Link to="/" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">
          ← Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
};
