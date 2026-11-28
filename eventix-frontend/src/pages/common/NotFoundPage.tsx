import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-14 h-14 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-4 shadow-xs">
        <Search className="w-7 h-7" />
      </div>

      <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">404 - Trang không tồn tại</h1>
      <p className="text-xs text-slate-600 max-w-sm mb-5">
        Đường dẫn bạn vừa truy cập không tồn tại hoặc đã được chuyển sang địa chỉ khác.
      </p>

      <Link
        to="/"
        className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-xs font-medium text-white flex items-center gap-1.5 shadow-xs"
      >
        <Home className="w-3.5 h-3.5" />
        Quay về Trang chủ
      </Link>
    </div>
  );
};
