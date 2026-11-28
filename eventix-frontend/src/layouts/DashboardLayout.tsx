import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Ticket,
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck,
  Flame,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Building2,
  Menu,
  X,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = hasRole('ROLE_ADMIN');
  const isOrganizer = hasRole('ROLE_ORGANIZER');

  const navItems = [
    ...(isAdmin
      ? [
          {
            title: 'Hệ thống Quản trị (Admin)',
            items: [
              { label: 'Tổng quan hệ thống', path: '/admin/dashboard', icon: LayoutDashboard },
              { label: 'Duyệt sự kiện & Pre-warm', path: '/admin/events', icon: Flame },
              { label: 'Quản lý người dùng', path: '/admin/users', icon: Users },
            ],
          },
        ]
      : []),
    ...(isOrganizer
      ? [
          {
            title: 'Kênh Ban Tổ Chức (Organizer)',
            items: [
              { label: 'Tổng quan bán vé', path: '/organizer/dashboard', icon: LayoutDashboard },
              { label: 'Sự kiện của tôi', path: '/organizer/events', icon: CalendarCheck },
              { label: 'Tạo sự kiện mới', path: '/organizer/create-event', icon: CalendarPlus },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar for Desktop */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-200 bg-white transition-all duration-200 z-40 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <div className="h-14 flex items-center justify-between px-3 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 min-w-7 rounded-md bg-indigo-600 flex items-center justify-center text-white">
              <Ticket className="w-4 h-4" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs tracking-tight text-slate-900">EventiX Portal</span>
                <span className="text-[10px] uppercase font-semibold text-slate-500">
                  {isAdmin ? 'Admin Console' : 'Organizer Hub'}
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
          {navItems.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 min-w-4 text-slate-500" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}

          <div className="pt-3 border-t border-slate-200">
            <Link
              to="/"
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
            >
              <ExternalLink className="w-3.5 h-3.5 min-w-3.5" />
              {!collapsed && <span>Xem giao diện Khán giả</span>}
            </Link>
          </div>
        </div>

        <div className="p-2 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 p-1.5">
            <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-xs font-semibold text-indigo-600">
              {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.fullName || user?.email}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={logout}
                title="Đăng xuất"
                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-white cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={() => setMobileOpen(false)}></div>
          <div className="relative w-60 bg-white border-r border-slate-200 flex flex-col p-3 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="font-bold text-sm text-slate-900">EventiX Portal</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-3 space-y-3">
              {navItems.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">{group.title}</p>
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className="block px-2.5 py-1.5 rounded-md text-xs text-slate-700 hover:bg-slate-100"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="text-sm font-semibold text-slate-800">
              {isAdmin ? 'Quản trị viên Hệ thống' : 'Bảng điều khiển Ban Tổ Chức'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] px-2 py-0.5 rounded font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Hệ thống: Bình thường
            </span>
            <button
              onClick={logout}
              className="md:hidden p-1.5 text-rose-600 hover:bg-slate-100 rounded cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
