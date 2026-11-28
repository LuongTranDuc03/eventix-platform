import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, Home, LogOut, KeyRound } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const { user, logout, getDefaultRedirectForRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-14 h-14 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-xs">
        <ShieldAlert className="w-7 h-7" />
      </div>

      <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">403 - Quyền truy cập bị từ chối</h1>
      <p className="text-xs text-slate-600 max-w-sm mb-4">
        Bạn không có quyền hạn cần thiết để truy cập vào khu vực này. Trang này chỉ dành riêng cho các vai trò được cấp phép.
      </p>

      {user && (
        <div className="mb-4 p-3 rounded-md bg-white border border-slate-200 text-xs text-slate-600 text-left w-full max-w-md shadow-2xs">
          <p className="font-medium text-slate-800">Tài khoản hiện tại: {user.email}</p>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <span>Vai trò:</span>
            {user.roles.map((r) => (
              <span key={r} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                {r}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-500 italic">
            * Tài khoản này chỉ có quyền mua vé và xem ví vé của cá nhân. Để truy cập Bảng quản trị, vui lòng đăng nhập bằng tài khoản Quản trị viên (Admin) hoặc Ban tổ chức (Organizer).
          </p>
        </div>
      )}

      {/* Gợi ý tài khoản kiểm thử */}
      <div className="mb-5 p-3 rounded-md bg-indigo-50/60 border border-indigo-200/80 text-left w-full max-w-md text-xs text-slate-700">
        <div className="flex items-center gap-1.5 font-semibold text-indigo-900 mb-2">
          <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
          <span>Tài khoản thử nghiệm theo vai trò (Pass: 123456 hoặc Password123@)</span>
        </div>
        <ul className="space-y-1 text-[11px] font-mono text-slate-600">
          <li>• <strong className="text-indigo-700 font-sans">Admin:</strong> admin@eventix.com (Toàn quyền hệ thống)</li>
          <li>• <strong className="text-indigo-700 font-sans">Organizer:</strong> organizer.music@eventix.com (Tạo & quản lý sự kiện)</li>
          <li>• <strong className="text-indigo-700 font-sans">Staff:</strong> staff.gate.a@eventix.com (Soát vé Kiosk tại cổng)</li>
          <li>• <strong className="text-indigo-700 font-sans">Attendee:</strong> tranducluong@gmail.com (Khách hàng mua vé)</li>
        </ul>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button
          onClick={() => navigate(-1)}
          className="px-3.5 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại
        </button>

        <button
          onClick={() => navigate(getDefaultRedirectForRole())}
          className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-xs font-medium text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          Về trang chủ
        </button>

        <button
          onClick={handleLogout}
          className="px-3.5 py-1.5 rounded-md bg-rose-50 border border-rose-200 hover:bg-rose-100 text-xs font-medium text-rose-700 flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Đăng xuất / Đổi tài khoản
        </button>
      </div>
    </div>
  );
};
