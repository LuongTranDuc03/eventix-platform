import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QrCode, LogOut, Radio } from 'lucide-react';

export const StaffLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between">
      {/* Kiosk Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              EventiX Gate Scanner
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Radio className="w-2.5 h-2.5 text-emerald-600" />
                ONLINE
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">Nhân viên: {user?.fullName || user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Thoát
        </button>
      </header>

      {/* Main Scanner Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col">
        <Outlet />
      </main>

      {/* Mobile Footer Bar */}
      <footer className="bg-white border-t border-slate-200 py-2.5 px-4 text-center text-xs text-slate-500">
        Hệ thống soát vé chống gian lận & quét trùng lặp tức thì • EventiX
      </footer>
    </div>
  );
};
