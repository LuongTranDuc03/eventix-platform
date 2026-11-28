import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventApi } from '../../api/eventApi';
import type { EventItem } from '../../types/event';
import {
  CalendarPlus,
  Ticket,
  Users,
  TrendingUp,
  MapPin,
  Calendar,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const OrganizerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await eventApi.getAllEvents();
      if (res && res.data) {
        setEvents(res.data);
      }
    } catch (e) {
      console.error('Failed to load organizer events:', e);
    } finally {
      setLoading(false);
    }
  };

  // Metrics
  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === 'PUBLISHED').length;
  const totalCapacity = events.reduce(
    (acc, e) => acc + e.zones.reduce((zAcc, z) => zAcc + z.totalCapacity, 0),
    0
  );
  const totalAvailable = events.reduce(
    (acc, e) => acc + e.zones.reduce((zAcc, z) => zAcc + z.availableCapacity, 0),
    0
  );
  const totalSold = totalCapacity - totalAvailable;
  const soldPercent = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;

  const totalEstRevenue = events.reduce(
    (acc, e) =>
      acc +
      e.zones.reduce((zAcc, z) => zAcc + z.price * (z.totalCapacity - z.availableCapacity), 0),
    0
  );

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

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
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Kênh Quản trị Ban Tổ Chức (Organizer Hub)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Xin chào, <strong>{user?.fullName || user?.email}</strong>! Quản lý danh sách sự kiện và hiệu suất bán vé
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadEvents}
            className="p-2 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/organizer/create-event"
            className="px-3.5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            Tạo sự kiện mới
          </Link>
        </div>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span>Sự kiện quản lý</span>
            <Ticket className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">{totalEvents}</p>
          <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> {publishedEvents} sự kiện đã mở bán
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span>Tổng vé đã bán</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            {totalSold.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Trên tổng số {totalCapacity.toLocaleString()} vé
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span>Tỷ lệ lấp đầy</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">{soldPercent}%</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, soldPercent)}%` }}
            ></div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span>Doanh thu ước tính</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-extrabold text-indigo-700 font-mono truncate">
            {formatPrice(totalEstRevenue)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Theo tiến độ bán vé thực tế</p>
        </div>
      </div>

      {/* Events Table Management */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Danh sách Sự kiện ({events.length})
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Theo dõi trạng thái duyệt, thời gian mở bán và tồn kho từng phân khu
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Đang tải danh sách sự kiện...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Chưa có sự kiện nào</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Bạn chưa tạo sự kiện nào. Hãy bắt đầu khởi tạo sự kiện đầu tiên để mở bán vé!
            </p>
            <Link
              to="/organizer/create-event"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              Tạo sự kiện ngay
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Sự kiện</th>
                  <th className="py-3 px-4">Địa điểm & Lịch bán</th>
                  <th className="py-3 px-4">Phân khu vé</th>
                  <th className="py-3 px-4">Tiến độ bán</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((evt) => {
                  const evtCapacity = evt.zones.reduce((a, z) => a + z.totalCapacity, 0);
                  const evtAvailable = evt.zones.reduce((a, z) => a + z.availableCapacity, 0);
                  const evtSold = evtCapacity - evtAvailable;
                  const percent = evtCapacity > 0 ? Math.round((evtSold / evtCapacity) * 100) : 0;

                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Title & Banner */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              evt.bannerUrl ||
                              'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=120&q=80'
                            }
                            alt={evt.title}
                            className="w-12 h-10 object-cover rounded-md border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0 max-w-[200px]">
                            <p className="font-bold text-slate-900 truncate">{evt.title}</p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: #{evt.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Venue & Time */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1 text-slate-700 truncate max-w-[180px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {evt.venue}
                          </p>
                          <p className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            {formatDate(evt.salesStartTime)} - {formatDate(evt.salesEndTime)}
                          </p>
                        </div>
                      </td>

                      {/* Zones Summary */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {evt.zones.map((z) => (
                            <span
                              key={z.id}
                              className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-600"
                            >
                              {z.name}: {z.availableCapacity}/{z.totalCapacity}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Progress Bar */}
                      <td className="py-3.5 px-4">
                        <div className="w-28 space-y-1">
                          <div className="flex justify-between text-[10px] font-mono text-slate-500">
                            <span>{evtSold}</span>
                            <span>{evtCapacity} vé</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full"
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {evt.status === 'PUBLISHED' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Đang mở bán
                          </span>
                        ) : evt.status === 'DRAFT' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Chờ Admin duyệt
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            {evt.status}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/events/${evt.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                          Xem trang
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
