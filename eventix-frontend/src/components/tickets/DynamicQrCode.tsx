import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { TicketStatus } from '../../types/ticket';
import { ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface DynamicQrCodeProps {
  ticketCode: string;
  status: TicketStatus;
  size?: number;
  showTimer?: boolean;
}

export const DynamicQrCode: React.FC<DynamicQrCodeProps> = ({
  ticketCode,
  status,
  size = 140,
  showTimer = true,
}) => {
  const [countdown, setCountdown] = useState<number>(15);
  const [epoch, setEpoch] = useState<number>(() => Math.floor(Date.now() / 15000));

  useEffect(() => {
    if (status !== 'ISSUED') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setEpoch(Math.floor(Date.now() / 15000));
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  // Mã QR động chứa mã vé và muối thời gian xoay tua mỗi 15 giây
  const dynamicPayload = `${ticketCode}#EP_${epoch}`;
  const isUsed = status === 'CHECKED_IN';
  const isRevoked = status === 'REVOKED';

  return (
    <div className="flex flex-col items-center">
      <div className="relative p-2.5 bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden group">
        <QRCodeSVG
          value={dynamicPayload}
          size={size}
          level="H"
          className={isUsed || isRevoked ? 'opacity-20 blur-[1px]' : ''}
        />

        {/* Dynamic Scan Line Animation (Chống chụp màn hình gian lận) */}
        {!isUsed && !isRevoked && (
          <div className="absolute inset-x-0 h-0.5 bg-indigo-500/80 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse pointer-events-none top-1/2 -translate-y-1/2"></div>
        )}

        {/* Overlay trạng thái nếu vé đã sử dụng hoặc bị hủy */}
        {isUsed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 p-2 text-center text-white">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1" />
            <span className="text-[10px] font-bold tracking-wider uppercase">Đã Check-in</span>
          </div>
        )}

        {isRevoked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-900/70 p-2 text-center text-white">
            <AlertTriangle className="w-8 h-8 text-rose-300 mb-1" />
            <span className="text-[10px] font-bold tracking-wider uppercase">Vé Đã Hủy</span>
          </div>
        )}
      </div>

      {/* Dynamic Token Refresh Indicator */}
      {showTimer && !isUsed && !isRevoked && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-slate-600">Động: {countdown}s</span>
          <RefreshCw className="w-2.5 h-2.5 text-slate-400 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
      )}

      {showTimer && !isUsed && !isRevoked && (
        <div className="flex items-center gap-1 mt-0.5 text-[9px] text-slate-400">
          <ShieldCheck className="w-3 h-3 text-indigo-500" />
          <span>Chống chụp màn hình</span>
        </div>
      )}
    </div>
  );
};

