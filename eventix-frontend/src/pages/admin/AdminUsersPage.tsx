import React, { useState, useEffect } from 'react';
import { authApi } from '../../api/authApi';
import type { UserItem } from '../../types/auth';
import {
  Users,
  ShieldCheck,
  UserCheck,
  KeyRound,
  Search,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await authApi.getAllUsers();
      if (res && res.data) {
        setUsers(res.data);
      }
    } catch (e) {
      console.error('Failed to load users from database:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Quản trị Người dùng & Phân quyền Vai trò (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu tài khoản thời gian thực lấy trực tiếp từ Database PostgreSQL
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="p-2 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer self-start sm:self-auto"
          title="Tải lại danh sách người dùng"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Role Matrix Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            ROLE_ADMIN
          </div>
          <p className="text-xs text-slate-600">Toàn quyền hệ thống, phê duyệt sự kiện và nạp kho Redis.</p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-purple-700 font-bold mb-1">
            <UserCheck className="w-4 h-4" />
            ROLE_ORGANIZER
          </div>
          <p className="text-xs text-slate-600">Khởi tạo sự kiện, cấu hình phân khu vé và xem doanh thu.</p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold mb-1">
            <KeyRound className="w-4 h-4" />
            ROLE_STAFF
          </div>
          <p className="text-xs text-slate-600">Sử dụng kiosk quét mã QR soát vé tại cổng check-in.</p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-blue-700 font-bold mb-1">
            <Users className="w-4 h-4" />
            ROLE_ATTENDEE
          </div>
          <p className="text-xs text-slate-600">Khách hàng: Xếp hàng phòng chờ, đặt vé, thanh toán và ví vé.</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Danh sách Tài khoản Người dùng ({users.length})
          </h2>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo email hoặc họ tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:border-indigo-600"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Đang tải danh sách người dùng từ Database...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 italic text-xs">
            Không tìm thấy người dùng phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Họ và tên / Email</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Vai trò (Role)</th>
                  <th className="py-3 px-4">Ngày đăng ký</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{u.fullName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      {u.phoneNumber || '---'}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                              r === 'ROLE_ADMIN'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : r === 'ROLE_ORGANIZER'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : r === 'ROLE_STAFF'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {r.replace('ROLE_', '')}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-500">{formatDate(u.createdAt)}</td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Hoạt động
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
