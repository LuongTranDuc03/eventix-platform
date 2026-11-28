import React from 'react';
import type { TicketItem } from '../../types/ticket';
import { DynamicQrCode } from './DynamicQrCode';
import {
  Calendar,
  MapPin,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  Tag,
  Hash,
  Armchair,
} from 'lucide-react';

interface TicketCardProps {
  ticket: TicketItem;
  onEnlargeQr: (ticket: TicketItem) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onEnlargeQr }) => {
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Thời gian sắp diễn ra';
    try {
      return new Date(isoString).toLocaleDateString('vi-VN', {
        weekday: 'short',
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

  const getStatusBadge = () => {
    switch (ticket.status) {
      case 'ISSUED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            HỢP LỆ • SẴN SÀNG QUÉT
          </span>
        );
      case 'CHECKED_IN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <CheckCircle2 className="w-3 h-3 text-slate-500" />
            ĐÃ CHECK-IN TẠI CỔNG
          </span>
        );
      case 'REVOKED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" />
            ĐÃ THU HỒI
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row overflow-hidden relative">
      {/* Left stub section: Event info */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            {getStatusBadge()}
            <span className="text-[10px] font-mono text-slate-400">
              Đơn hàng #{ticket.orderId}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 line-clamp-2">
            {ticket.eventTitle || 'Sự kiện âm nhạc'}
          </h3>

          <div className="mt-3 space-y-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>{formatDate(ticket.eventStartDate)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{ticket.eventVenue || 'Địa điểm tổ chức'}</span>
            </div>
          </div>
        </div>

        {/* Ticket Zone & Seat Info */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-400 block flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Phân khu vé
            </span>
            <span className="font-bold text-slate-800 truncate block mt-0.5">
              {ticket.zoneName || `Khu vực #${ticket.zoneId}`}
            </span>
          </div>

          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-400 block flex items-center gap-1">
              <Armchair className="w-3 h-3" />
              Vị trí / Ghế ngồi
            </span>
            <span className="font-mono font-bold text-indigo-700 truncate block mt-0.5">
              {ticket.seatNumber ? ticket.seatNumber : 'Vé Đứng (Tự do)'}
            </span>
          </div>
        </div>

        {/* Ticket Code Footnote */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1 font-mono">
            <Hash className="w-3 h-3" />
            {ticket.ticketCode}
          </span>
          {ticket.checkedInAt && (
            <span className="text-[10px] text-slate-500">
              Quét lúc {new Date(ticket.checkedInAt).toLocaleTimeString('vi-VN')}
            </span>
          )}
        </div>
      </div>

      {/* Perforated Divider line between stub and QR */}
      <div className="hidden md:flex flex-col items-center justify-between relative py-2">
        <div className="w-4 h-4 rounded-full bg-slate-100 -mt-4 border-b border-slate-200"></div>
        <div className="w-[1px] h-full border-r border-dashed border-slate-300 my-1"></div>
        <div className="w-4 h-4 rounded-full bg-slate-100 -mb-4 border-t border-slate-200"></div>
      </div>

      {/* Mobile horizontal divider */}
      <div className="md:hidden border-b border-dashed border-slate-300 w-full relative">
        <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-slate-100 border-r border-slate-200"></div>
        <div className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-slate-100 border-l border-slate-200"></div>
      </div>

      {/* Right stub section: Dynamic Anti-screenshot QR */}
      <div className="p-5 bg-slate-50/50 flex flex-col items-center justify-center md:w-56 shrink-0 border-t md:border-t-0 md:border-l border-slate-200/60">
        <DynamicQrCode ticketCode={ticket.ticketCode} status={ticket.status} size={120} />

        {ticket.status === 'ISSUED' && (
          <button
            onClick={() => onEnlargeQr(ticket)}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3 h-3 text-slate-500" />
            Phóng to mã QR
          </button>
        )}
      </div>
    </div>
  );
};

