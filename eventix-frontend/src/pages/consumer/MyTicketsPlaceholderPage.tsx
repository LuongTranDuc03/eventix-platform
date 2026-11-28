import React from 'react';
import { Ticket, QrCode, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyTicketsPlaceholderPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Ví vé của tôi</h1>
          <p className="text-xs text-slate-500 mt-0.5">Danh sách vé điện tử và mã QR soát vé tại cửa</p>
        </div>
        <Link
          to="/"
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Tiếp tục xem sự kiện
        </Link>
      </div>

      <div className="p-8 rounded-lg bg-white border border-slate-200 text-center flex flex-col items-center justify-center shadow-xs">
        <div className="w-12 h-12 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-3">
          <Ticket className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Không gian Ví vé (Role: ROLE_USER)</h3>
        <p className="text-xs text-slate-500 max-w-md mb-5 leading-relaxed">
          Tính năng tải vé thực tế từ API <code className="text-indigo-600 font-mono">/api/v1/tickets/my-tickets</code> và tự động sinh mã QR sẽ được hoàn thiện trong Giai đoạn 4.
        </p>
        <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 flex items-center gap-2">
          <QrCode className="w-4 h-4 text-emerald-600" />
          <span>Demo Ticket Code: EVTX-9872-VIP-01 (Ready for Gate Scan)</span>
        </div>
      </div>
    </div>
  );
};
