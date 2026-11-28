import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventApi } from '../../api/eventApi';
import type { EventItem } from '../../types/event';
import { EventCard } from '../../components/events/EventCard';
import { Ticket, ShieldCheck, Zap, Search, Filter, RefreshCw, CheckCircle2 } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'OPEN' | 'UPCOMING'>('ALL');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await eventApi.getAllEvents();
      setEvents(res.data || []);
    } catch (e) {
      console.error('Error fetching events:', e);
    } finally {
      setLoading(false);
    }
  };

  // Filter & Search logic
  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'OPEN') {
      return new Date(e.salesStartTime) <= new Date() && new Date(e.salesEndTime) >= new Date();
    }
    if (selectedFilter === 'UPCOMING') {
      return new Date(e.salesStartTime) > new Date();
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner Section */}
      <div className="rounded-lg bg-white border border-slate-200 p-6 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5" />
            Hạ tầng Phân phối vé Chịu tải cao
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
            Săn Vé Concert Trực Tuyến Tốc Độ Cao
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
            Hệ thống tích hợp phòng chờ ảo Redis ZSET, chống tranh chấp dữ liệu bằng Lua Script nguyên tử và xuất vé bất đồng bộ qua RabbitMQ. Không lo nghẽn mạng hay sập server.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#event-catalog"
              className="px-4 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              Khám phá danh sách concert
            </a>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="px-4 py-2.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs shadow-xs transition-colors"
              >
                Đăng ký tài khoản
              </Link>
            )}
          </div>
        </div>

        {/* Hero Quick Stat Box */}
        <div className="w-full md:w-72 bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Cam kết hệ thống
          </p>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
              <span>Độ trễ trừ kho:</span>
              <span className="font-mono font-semibold text-emerald-700">&lt; 5ms</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
              <span>Overbooking:</span>
              <span className="font-mono font-semibold text-emerald-700">Tuyệt đối 0%</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Thời gian giữ vé:</span>
              <span className="font-mono font-semibold text-indigo-700">10:00 Phút</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div id="event-catalog" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tên sự kiện, ca sĩ, địa điểm..."
            className="w-full pl-9 pr-3 py-2 rounded-md bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tất cả ({events.length})
          </button>
          <button
            onClick={() => setSelectedFilter('OPEN')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedFilter === 'OPEN'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Đang mở bán
          </button>
          <button
            onClick={() => setSelectedFilter('UPCOMING')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedFilter === 'UPCOMING'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Sắp diễn ra
          </button>
          <button
            onClick={loadEvents}
            title="Làm mới danh sách"
            className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Event Grid Section */}
      <div>
        {loading ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-lg">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-medium text-slate-500">Đang tải danh sách sự kiện từ hệ thống...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-lg">
            <Filter className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-slate-800">Không tìm thấy sự kiện nào</h4>
            <p className="text-xs text-slate-500 mt-1">Vui lòng thử lại với từ khóa tìm kiếm hoặc bộ lọc khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-3">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Phòng chờ ảo thông minh</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Xếp hàng người dùng theo cơ chế FIFO bằng Redis Sorted Set, kiểm soát lưu lượng truy cập bằng Pass-Token tự động.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
            Key: queue:waiting:event_id
          </div>
        </div>

        <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Trừ kho nguyên tử 0ms</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Thực thi trừ kho vé trực tiếp trên RAM Redis bằng Lua Script, triệt tiêu 100% tình trạng bán quá số vé (Overbooking).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
            Script: decrement_stock.lua
          </div>
        </div>

        <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-md bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Soát vé cổng chống gian lận</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mỗi vé gắn liền với mã QR độc nhất, cập nhật trạng thái tức thì và cảnh báo đỏ ngay nếu phát hiện vé quét trùng lặp.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
            Status: ISSUED → CHECKED_IN
          </div>
        </div>
      </div>
    </div>
  );
};
