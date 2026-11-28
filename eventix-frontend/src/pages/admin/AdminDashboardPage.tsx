import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventApi } from '../../api/eventApi';
import { authApi } from '../../api/authApi';
import type { EventItem } from '../../types/event';
import {
  ShieldCheck,
  Flame,
  Server,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MapPin,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL');
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Admin API Health Test
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

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
      console.error('Failed to load admin events:', e);
    } finally {
      setLoading(false);
    }
  };

  // Duyệt sự kiện & Pre-warm kho vé lên Redis
  const handlePublishAndPrewarm = async (eventId: number, eventTitle: string) => {
    setPublishingId(eventId);
    setNotification(null);

    try {
      await eventApi.publishEvent(eventId);
      setNotification({
        type: 'success',
        message: `Đã phê duyệt và PRE-WARM thành công kho vé sự kiện "${eventTitle}" lên Redis Cache!`,
      });

      // Cập nhật trạng thái sự kiện trong state
      setEvents((prev) =>
        prev.map((evt) => (evt.id === eventId ? { ...evt, status: 'PUBLISHED' } : evt))
      );
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Lỗi khi phê duyệt và nạp vé lên Redis',
      });
    } finally {
      setPublishingId(null);
    }
  };

  const handleTestAdminApi = async () => {
    setTesting(true);
    try {
      const res = await authApi.testAdminOnly();
      setTestResult(`[200 OK] Server phản hồi: "${res.data}"`);
    } catch (e: any) {
      setTestResult(`[Lỗi] ${e?.message || 'Không thể gọi API Admin'}`);
    } finally {
      setTesting(false);
    }
  };

  const draftCount = events.filter((e) => e.status === 'DRAFT').length;
  const publishedCount = events.filter((e) => e.status === 'PUBLISHED').length;

  const filteredEvents = events.filter((e) => {
    if (filterStatus === 'DRAFT') return e.status === 'DRAFT';
    if (filterStatus === 'PUBLISHED') return e.status === 'PUBLISHED';
    return true;
  });

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Hệ thống Quản trị Toàn diện (Admin Console)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Trung tâm kiểm duyệt sự kiện, nạp kho vé Pre-warm lên Redis và giám sát hạ tầng chịu tải cao
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
        </div>
      </div>

      {/* Cluster Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <Server className="w-3.5 h-3.5 text-indigo-600" />
            Spring Boot 3.3.5
          </div>
          <p className="text-lg font-bold text-slate-900 font-mono">Java 21 LTS</p>
          <span className="text-[10px] text-emerald-600 font-medium">Virtual Threads Enabled</span>
        </div>

        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            Redis Cluster Engine
          </div>
          <p className="text-lg font-bold text-slate-900 font-mono">Port 6379 Active</p>
          <span className="text-[10px] text-emerald-600 font-medium">Lua Atomic & ZSET Queue</span>
        </div>

        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            RabbitMQ Broker
          </div>
          <p className="text-lg font-bold text-slate-900 font-mono">Port 5672 Active</p>
          <span className="text-[10px] text-emerald-600 font-medium">Ticket Issuance Queue</span>
        </div>

        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            PostgreSQL 16
          </div>
          <p className="text-lg font-bold text-slate-900 font-mono">ACID Database</p>
          <span className="text-[10px] text-slate-500 font-medium">Flyway Schema V1 Active</span>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-lg border text-xs flex items-center justify-between gap-3 animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>

          <button
            onClick={() => setNotification(null)}
            className="text-[11px] underline hover:opacity-80 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Main Core Section: Event Approval & Redis Pre-warm Center */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600" />
              Trung tâm Phê duyệt Sự kiện & Pre-warm Kho vé lên Redis
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Phê duyệt sự kiện mới và nạp sẵn số lượng vé từng phân khu vào Redis để chuẩn bị đón lưu lượng truy cập cao
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-md border border-slate-200 text-xs self-start">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
                filterStatus === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tất cả ({events.length})
            </button>
            <button
              onClick={() => setFilterStatus('DRAFT')}
              className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                filterStatus === 'DRAFT'
                  ? 'bg-white text-amber-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Chờ duyệt
              {draftCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[9px] font-bold">
                  {draftCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterStatus('PUBLISHED')}
              className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
                filterStatus === 'PUBLISHED'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Đã nạp Redis ({publishedCount})
            </button>
          </div>
        </div>

        {/* Events Approval List */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Đang tải danh sách sự kiện...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center italic">
            Không có sự kiện nào trong danh mục này.
          </p>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((evt) => {
              const totalCap = evt.zones.reduce((a, z) => a + z.totalCapacity, 0);
              const isDraft = evt.status === 'DRAFT';
              const isPublishing = publishingId === evt.id;

              return (
                <div
                  key={evt.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isDraft
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Event summary */}
                    <div className="flex items-start gap-3 min-w-0">
                      <img
                        src={
                          evt.bannerUrl ||
                          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=120&q=80'
                        }
                        alt={evt.title}
                        className="w-16 h-12 object-cover rounded-md border border-slate-200 shrink-0"
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-sm text-slate-900 truncate">{evt.title}</h3>
                          <span className="text-[10px] font-mono text-slate-400">ID: #{evt.id}</span>
                          {isDraft ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                              Chờ duyệt & Nạp Redis
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              Đã nạp sẵn Redis Stock
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {evt.venue}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            Mở bán: {formatDate(evt.salesStartTime)}
                          </span>
                          <span className="font-mono text-slate-700 font-semibold">
                            Tổng {totalCap.toLocaleString()} vé ({evt.zones.length} phân khu)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Link
                        to={`/events/${evt.id}`}
                        className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium transition-colors inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                        Xem trang
                      </Link>

                      {isDraft && (
                        <button
                          onClick={() => handlePublishAndPrewarm(evt.id, evt.title)}
                          disabled={isPublishing}
                          className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          {isPublishing ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <Flame className="w-3.5 h-3.5 text-amber-300" />
                              Duyệt & Pre-warm Kho vé lên Redis
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Zones Detail Breakdown */}
                  <div className="mt-3 pt-3 border-t border-slate-100/80 flex flex-wrap gap-2 text-[11px]">
                    <span className="text-slate-400 font-semibold self-center">Phân khu:</span>
                    {evt.zones.map((z) => (
                      <span
                        key={z.id}
                        className="p-1.5 rounded bg-white border border-slate-200 text-slate-700 font-mono"
                      >
                        <strong>{z.name}</strong> ({z.zoneType === 'STANDING' ? 'Đứng' : 'Ngồi'}):{' '}
                        {formatPrice(z.price)} • {z.totalCapacity} vé
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RBAC API Test Card */}
      <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <h3 className="font-bold text-slate-800">Kiểm thử API Endpoint Cấp cao (/api/v1/admin/dashboard)</h3>
          <p className="text-slate-500 mt-0.5">
            Xác minh quyền hạn bảo vệ cấp độ Controller (`@PreAuthorize("hasAuthority('ROLE_ADMIN')")`)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {testResult && (
            <span className="font-mono text-[11px] px-2 py-1 rounded bg-slate-100 text-slate-700">
              {testResult}
            </span>
          )}

          <button
            onClick={handleTestAdminApi}
            disabled={testing}
            className="px-3.5 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            {testing ? 'Đang gửi...' : 'Test API'}
          </button>
        </div>
      </div>
    </div>
  );
};
