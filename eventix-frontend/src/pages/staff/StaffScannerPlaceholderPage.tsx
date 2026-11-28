import React, { useState } from 'react';
import { ScanLine, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export const StaffScannerPlaceholderPage: React.FC = () => {
  const [ticketInput, setTicketInput] = useState('');
  const [scanResult, setScanResult] = useState<{
    status: 'SUCCESS' | 'DUPLICATE' | 'INVALID';
    message: string;
    details?: string;
  } | null>(null);

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;

    if (ticketInput.includes('DUP')) {
      setScanResult({
        status: 'DUPLICATE',
        message: 'CẢNH BÁO: VÉ ĐÃ ĐƯỢC QUÉT TRƯỚC ĐÓ!',
        details: 'Vé này đã check-in lúc 19:42:15 tại Cửa A. Phát hiện hành vi quét trùng lặp!',
      });
    } else if (ticketInput.includes('INVALID')) {
      setScanResult({
        status: 'INVALID',
        message: 'VÉ KHÔNG HỢP LỆ HOẶC KHÔNG TỒN TẠI',
        details: 'Mã vé không tồn tại trong hệ thống EventiX.',
      });
    } else {
      setScanResult({
        status: 'SUCCESS',
        message: 'CHECK-IN THÀNH CÔNG',
        details: `Khách: Nguyễn Văn A • Khu: VIP 01 • Cửa vào: Cửa 2`,
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-2">
      <div>
        {/* Scanner Viewfinder Box */}
        <div className="relative aspect-square w-full rounded-lg bg-white border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-6 mb-4 shadow-xs">
          <div className="w-48 h-48 border border-slate-300 rounded-md relative flex items-center justify-center">
            <div className="w-full h-0.5 bg-indigo-600/60 absolute top-1/2 -translate-y-1/2"></div>
            <ScanLine className="w-10 h-10 text-slate-400" />
          </div>

          <p className="text-xs text-slate-600 text-center font-medium mt-3">
            Hướng camera vào mã QR của khán giả
          </p>
          <span className="text-[11px] text-slate-400 font-mono">(Tích hợp Web Camera trong Giai đoạn 5)</span>
        </div>

        {/* Scan feedback card */}
        {scanResult && (
          <div
            className={`p-3 rounded-md border mb-4 text-center ${
              scanResult.status === 'SUCCESS'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : scanResult.status === 'DUPLICATE'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div className="flex items-center justify-center mb-1">
              {scanResult.status === 'SUCCESS' && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
              {scanResult.status === 'DUPLICATE' && <XCircle className="w-6 h-6 text-rose-600" />}
              {scanResult.status === 'INVALID' && <AlertTriangle className="w-6 h-6 text-amber-600" />}
            </div>
            <h4 className="font-bold text-xs">{scanResult.message}</h4>
            {scanResult.details && <p className="text-[11px] mt-0.5 text-slate-600">{scanResult.details}</p>}
          </div>
        )}

        {/* Manual Code Input */}
        <form onSubmit={handleSimulateScan} className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Nhập mã vé thủ công (để kiểm tra)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="VD: EVTX-OK hoặc EVTX-DUP-01"
              className="flex-1 px-3 py-2 rounded-md bg-white border border-slate-300 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
            >
              Quét
            </button>
          </div>
        </form>

        {/* Quick test buttons */}
        <div className="mt-2.5 flex gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => setTicketInput('EVTX-2026-VIP-99')}
            className="flex-1 p-1.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 cursor-pointer text-center"
          >
            Mã Hợp lệ
          </button>
          <button
            type="button"
            onClick={() => setTicketInput('EVTX-DUP-DUPLICATE')}
            className="flex-1 p-1.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-50 cursor-pointer text-center"
          >
            Mã Trùng lặp
          </button>
        </div>
      </div>
    </div>
  );
};
