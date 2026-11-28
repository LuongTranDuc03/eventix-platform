import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketApi } from '../../api/ticketApi';
import type { TicketItem } from '../../types/ticket';
import { TicketCard } from '../../components/tickets/TicketCard';
import { DynamicQrCode } from '../../components/tickets/DynamicQrCode';
import {
  Ticket,
  RefreshCw,
  Search,
  X,
  ArrowRight,
  Sun,
} from 'lucide-react';

export const MyTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ISSUED' | 'CHECKED_IN'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await ticketApi.getMyTickets();
      if (res && res.data) {
        setTickets(res.data);
      }
    } catch (e) {
      console.error('Failed to load my tickets:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'ISSUED' && t.status === 'ISSUED') ||
      (filterStatus === 'CHECKED_IN' && t.status === 'CHECKED_IN');

    const matchSearch =
      searchTerm === '' ||
      t.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.eventTitle && t.eventTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.zoneName && t.zoneName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchStatus && matchSearch;
  });

  const activeCount = tickets.filter((t) => t.status === 'ISSUED').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-600">
              <Ticket className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Ví Vé Điện Tử Của Tôi</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý toàn bộ vé tham gia sự kiện và xuất trình mã QR động tại cổng check-in
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            {activeCount} vé sẵn sàng quét
          </span>
          <button
            onClick={loadTickets}
            className="p-2 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-md border border-slate-200 self-start">
          <button
            type="button"
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Tất cả ({tickets.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('ISSUED')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              filterStatus === 'ISSUED'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Hợp lệ ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('CHECKED_IN')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              filterStatus === 'CHECKED_IN'
                ? 'bg-white text-slate-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Đã Check-in ({tickets.filter((t) => t.status === 'CHECKED_IN').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo sự kiện, mã vé, phân khu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">Đang tải danh sách vé trong ví...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
          <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">
            {tickets.length === 0
              ? 'Ví của bạn hiện đang trống'
              : 'Không tìm thấy vé phù hợp với bộ lọc'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {tickets.length === 0
              ? 'Bạn chưa mua vé cho sự kiện nào. Hãy khám phá ngay các chương trình âm nhạc hot đang mở bán!'
              : 'Hãy thử tìm kiếm với từ khóa khác hoặc chuyển chế độ xem tất cả vé.'}
          </p>
          {tickets.length === 0 && (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
            >
              Khám phá sự kiện ngay
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onEnlargeQr={(t) => setSelectedTicket(t)}
            />
          ))}
        </div>
      )}

      {/* Enlarge QR Modal for Gate Scanning */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl max-w-sm w-full p-6 shadow-xl relative space-y-4">
            {/* Close Button */}
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-1 pr-6">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold inline-block">
                MÃ CHECK-IN TẠI CỔNG
              </span>
              <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                {selectedTicket.eventTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedTicket.zoneName} • {selectedTicket.seatNumber || 'Vé Đứng'}
              </p>
            </div>

            {/* Dynamic QR High-Res Display */}
            <div className="py-2 flex justify-center">
              <DynamicQrCode
                ticketCode={selectedTicket.ticketCode}
                status={selectedTicket.status}
                size={220}
                showTimer={true}
              />
            </div>

            {/* Instructions */}
            <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-[11px] text-amber-800 space-y-1">
              <div className="flex items-center gap-1 font-semibold">
                <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Hướng dẫn quét vé tại cổng:</span>
              </div>
              <p className="text-amber-700 leading-relaxed">
                Vui lòng tăng độ sáng màn hình lên mức cao nhất và đưa mã QR này trước máy quét của nhân viên soát vé.
              </p>
            </div>

            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full py-2 px-3 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
