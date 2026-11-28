import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, LogOut, LayoutDashboard, QrCode, Menu, X } from 'lucide-react';

export const ConsumerLayout: React.FC = () => {
  const { user, isAuthenticated, logout, hasRole, getDefaultRedirectForRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Ticket className="w-4 h-4 transform -rotate-12" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                Eventi<span className="text-indigo-600">X</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Khám phá sự kiện
              </Link>
              <Link
                to="/my-tickets"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5"
              >
                <Ticket className="w-4 h-4 text-indigo-600" />
                Ví vé của tôi
              </Link>
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm font-medium text-slate-700 max-w-[130px] truncate">
                      {user.fullName || user.email}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      onMouseLeave={() => setUserDropdownOpen(false)}
                      className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50 animate-in fade-in duration-100"
                    >
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user.fullName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {user.roles.map((r) => (
                            <span
                              key={r}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {r.replace('ROLE_', '')}
                            </span>
                          ))}
                        </div>
                      </div>

                      {(hasRole('ROLE_ADMIN') || hasRole('ROLE_ORGANIZER')) && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            navigate(getDefaultRedirectForRole());
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 font-medium cursor-pointer"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          Vào Bảng Quản Trị
                        </button>
                      )}

                      {hasRole('ROLE_STAFF') && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            navigate('/staff/scanner');
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 font-medium cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          Vào Cổng Soát Vé (Staff)
                        </button>
                      )}

                      <Link
                        to="/my-tickets"
                        onClick={() => setUserDropdownOpen(false)}
                        className="px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        Ví vé của tôi
                      </Link>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={logout}
                        className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="text-xs font-semibold text-white px-3.5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Khám phá sự kiện
            </Link>
            <Link
              to="/my-tickets"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Vé của tôi
            </Link>
            {isAuthenticated ? (
              <div className="pt-2 border-t border-slate-200">
                <p className="px-3 text-xs text-slate-500">{user?.fullName}</p>
                <button
                  onClick={logout}
                  className="w-full mt-2 text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-md flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-200 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold rounded-md border border-slate-300 text-slate-700"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold rounded-md bg-indigo-600 text-white"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-auto text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Ticket className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-800">EventiX Platform</span>
            <span>— Hệ thống phân phối vé sự kiện & concert</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Kiến trúc chuẩn doanh nghiệp: Java 21, Spring Boot 3.3, Redis 7 ZSET, RabbitMQ & React Vite.
          </p>
        </div>
      </footer>
    </div>
  );
};
