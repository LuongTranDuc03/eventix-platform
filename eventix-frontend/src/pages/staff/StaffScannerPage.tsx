import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ticketApi } from '../../api/ticketApi';
import type { TicketItem } from '../../types/ticket';
import { sounds } from '../../utils/soundEffects';
import {
  Camera,
  CameraOff,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Volume2,
  VolumeX,
  History,
  Barcode,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface ScanHistoryItem {
  id: string;
  time: string;
  ticketCode: string;
  status: 'SUCCESS' | 'DUPLICATE' | 'INVALID';
  message: string;
}

export const StaffScannerPage: React.FC = () => {
  const [ticketInput, setTicketInput] = useState<string>('');
  const [isScanningCamera, setIsScanningCamera] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);

  // Thống kê ca trực
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    fraud: 0,
  });

  // Kết quả quét hiện tại
  const [scanResult, setScanResult] = useState<{
    status: 'SUCCESS' | 'DUPLICATE' | 'INVALID';
    ticketCode: string;
    message: string;
    timestamp: string;
  } | null>(null);

  // Lịch sử các lần quét gần nhất
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  // Danh sách vé mẫu có sẵn trong hệ thống để test nhanh
  const [sampleTickets, setSampleTickets] = useState<TicketItem[]>([]);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Tải danh sách vé mẫu để test nhanh
    loadSampleTickets();

    return () => {
      stopCamera();
    };
  }, []);

  const loadSampleTickets = async () => {
    try {
      const res = await ticketApi.getMyTickets();
      if (res && res.data) {
        setSampleTickets(res.data.slice(0, 5));
      }
    } catch {
      // Mock sample tickets if none found
    }
  };

  // Bật camera
  const startCamera = async () => {
    try {
      const html5QrCode = new Html5Qrcode('qr-reader-container');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          handleExecuteCheckin(decodedText);
        },
        () => {
          // Frame parse error - ignore
        }
      );

      setIsScanningCamera(true);
    } catch (err) {
      console.error('Failed to start camera:', err);
      alert('Không thể mở camera. Vui lòng cấp quyền truy cập camera trong trình duyệt hoặc sử dụng chế độ nhập mã / máy quét cầm tay.');
      setIsScanningCamera(false);
    }
  };

  // Tắt camera
  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.error('Error stopping camera:', e);
      }
    }
    setIsScanningCamera(false);
  };

  // Xử lý quét và gọi API check-in tại cổng
  const handleExecuteCheckin = async (rawCode: string) => {
    if (!rawCode.trim() || processing) return;

    // Lọc bỏ chuỗi muối động (#EP_...) từ dynamic QR
    const cleanCode = rawCode.includes('#') ? rawCode.split('#')[0] : rawCode.trim();
    setProcessing(true);
    const nowTime = new Date().toLocaleTimeString('vi-VN');

    try {
      const res = await ticketApi.scanTicket(cleanCode);

      // 1. Quét thành công
      if (soundEnabled) sounds.playSuccess();

      const successItem: ScanHistoryItem = {
        id: Date.now().toString(),
        time: nowTime,
        ticketCode: cleanCode,
        status: 'SUCCESS',
        message: res.message || 'Check-in thành công. Mời khách vào cửa!',
      };

      setScanResult({
        status: 'SUCCESS',
        ticketCode: cleanCode,
        message: res.message || 'Check-in thành công. Mời khán giả vào cổng!',
        timestamp: nowTime,
      });

      setStats((prev) => ({
        ...prev,
        total: prev.total + 1,
        success: prev.success + 1,
      }));

      setHistory((prev) => [successItem, ...prev.slice(0, 9)]);
      setTicketInput('');
    } catch (err: any) {
      const errMsg: string = err?.message || 'Lỗi khi kiểm tra vé';

      // 2. Cảnh báo quét trùng lặp / vé đã sử dụng / gian lận
      if (
        errMsg.toLowerCase().includes('đã được sử dụng') ||
        errMsg.toLowerCase().includes('cảnh báo') ||
        errMsg.toLowerCase().includes('gian lận') ||
        errMsg.toLowerCase().includes('checked_in')
      ) {
        if (soundEnabled) sounds.playWarning();

        const dupItem: ScanHistoryItem = {
          id: Date.now().toString(),
          time: nowTime,
          ticketCode: cleanCode,
          status: 'DUPLICATE',
          message: errMsg,
        };

        setScanResult({
          status: 'DUPLICATE',
          ticketCode: cleanCode,
          message: errMsg,
          timestamp: nowTime,
        });

        setStats((prev) => ({
          ...prev,
          total: prev.total + 1,
          fraud: prev.fraud + 1,
        }));

        setHistory((prev) => [dupItem, ...prev.slice(0, 9)]);
      } else {
        // 3. Vé không tồn tại hoặc lỗi khác
        if (soundEnabled) sounds.playError();

        const invalidItem: ScanHistoryItem = {
          id: Date.now().toString(),
          time: nowTime,
          ticketCode: cleanCode,
          status: 'INVALID',
          message: errMsg || 'Mã vé không tồn tại trên hệ thống.',
        };

        setScanResult({
          status: 'INVALID',
          ticketCode: cleanCode,
          message: errMsg || 'Mã vé không tồn tại hoặc không hợp lệ.',
          timestamp: nowTime,
        });

        setStats((prev) => ({
          ...prev,
          total: prev.total + 1,
        }));

        setHistory((prev) => [invalidItem, ...prev.slice(0, 9)]);
      }
    } finally {
      setProcessing(false);
      // Auto focus lại vào input cho lần quét tiếp theo
      inputRef.current?.focus();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketInput.trim()) {
      handleExecuteCheckin(ticketInput.trim());
    }
  };

  return (
    <div className="space-y-4 py-2">
      {/* Top Session Stats Ribbon */}
      <div className="grid grid-cols-4 gap-2.5">
        <div className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Tổng đã quét</span>
          <span className="text-xl font-extrabold font-mono text-slate-900">{stats.total}</span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase block">Hợp lệ</span>
          <span className="text-xl font-extrabold font-mono text-emerald-700">{stats.success}</span>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-center shadow-xs">
          <span className="text-[10px] font-bold text-rose-600 uppercase block flex items-center justify-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-500" />
            Cảnh báo trùng
          </span>
          <span className="text-xl font-extrabold font-mono text-rose-700">{stats.fraud}</span>
        </div>

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`border rounded-lg p-3 flex flex-col items-center justify-center transition-colors cursor-pointer shadow-xs ${
            soundEnabled
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'bg-white border-slate-200 text-slate-400'
          }`}
          title="Bật/Tắt âm thanh bíp soát vé"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 mb-0.5" /> : <VolumeX className="w-4 h-4 mb-0.5" />}
          <span className="text-[10px] font-bold uppercase">{soundEnabled ? 'Bíp Bật' : 'Bíp Tắt'}</span>
        </button>
      </div>

      {/* High-Visibility Live Feedback Banner (Kiosk Alert) */}
      {scanResult && (
        <div
          className={`p-4 rounded-lg border-2 shadow-xs transition-all animate-in zoom-in-95 duration-150 ${
            scanResult.status === 'SUCCESS'
              ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
              : scanResult.status === 'DUPLICATE'
              ? 'bg-rose-50 border-rose-500 text-rose-950'
              : 'bg-amber-50 border-amber-500 text-amber-950'
          }`}
        >
          <div className="flex items-start gap-3">
            {scanResult.status === 'SUCCESS' && (
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
            )}
            {scanResult.status === 'DUPLICATE' && (
              <AlertTriangle className="w-8 h-8 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
            )}
            {scanResult.status === 'INVALID' && (
              <XCircle className="w-8 h-8 text-amber-600 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded tracking-wider ${
                    scanResult.status === 'SUCCESS'
                      ? 'bg-emerald-200 text-emerald-900'
                      : scanResult.status === 'DUPLICATE'
                      ? 'bg-rose-200 text-rose-900'
                      : 'bg-amber-200 text-amber-900'
                  }`}
                >
                  {scanResult.status === 'SUCCESS'
                    ? 'HỢP LỆ • VÀO CỔNG'
                    : scanResult.status === 'DUPLICATE'
                    ? '⚠️ CẢNH BÁO QUÉT TRÙNG LẶP'
                    : 'KHÔNG HỢP LỆ'}
                </span>
                <span className="text-[10px] font-mono opacity-60">{scanResult.timestamp}</span>
              </div>

              <h2 className="text-base font-bold mt-1 tracking-tight leading-snug">
                {scanResult.message}
              </h2>

              <p className="text-xs font-mono mt-1 opacity-80">
                Mã vé: <strong>{scanResult.ticketCode}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Control Deck */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        {/* Toggle Camera vs Gun Scanner Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ScanLine className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Khu vực Quét Mã Vé
            </h3>
          </div>

          <button
            type="button"
            onClick={isScanningCamera ? stopCamera : startCamera}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-2xs ${
              isScanningCamera
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isScanningCamera ? (
              <>
                <CameraOff className="w-3.5 h-3.5" />
                Tắt Camera
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                Bật Camera Quét QR
              </>
            )}
          </button>
        </div>

        {/* Live Camera Viewfinder Box */}
        <div className="relative rounded-lg bg-slate-900 overflow-hidden min-h-[220px] flex flex-col items-center justify-center p-3">
          <div id="qr-reader-container" className="w-full max-w-[280px]"></div>

          {!isScanningCamera && (
            <div className="text-center p-4 text-slate-400 space-y-2">
              <Barcode className="w-10 h-10 mx-auto text-slate-500 opacity-60" />
              <p className="text-xs text-slate-300 font-medium">Camera đang tắt</p>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Sử dụng <strong>máy quét mã vạch cầm tay</strong> (súng bắn mã), gõ mã vào ô bên dưới, hoặc bật Camera thiết bị.
              </p>
            </div>
          )}
        </div>

        {/* Barcode Gun / Manual Input Box */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <label className="block text-[11px] font-semibold text-slate-700 flex items-center justify-between">
            <span>Nhập mã vé hoặc Bắn súng mã vạch:</span>
            <span className="text-[10px] text-slate-400 font-mono">(Tự động Submit khi ấn Enter)</span>
          </label>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                placeholder="Ví dụ: TKT-1-ABCD1234"
                disabled={processing}
                className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 bg-slate-50 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={processing || !ticketInput.trim()}
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {processing ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Quét ngay'
              )}
            </button>
          </div>
        </form>

        {/* Quick Test Sample Tickets */}
        {sampleTickets.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Vé mẫu trong hệ thống (Nhấn để test quét nhanh):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleTickets.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleExecuteCheckin(t.ticketCode)}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[10px] font-mono text-slate-700 transition-colors cursor-pointer"
                >
                  {t.ticketCode} ({t.status === 'CHECKED_IN' ? 'Đã quét' : 'Chưa quét'})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Live Recent Scans History Log */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Nhật ký soát vé ca trực ({history.length})
            </h3>
          </div>

          {history.length > 0 && (
            <button
              onClick={() => setHistory([])}
              className="text-[11px] text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
            >
              Xóa nhật ký
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center italic">
            Chưa có lượt quét nào trong ca trực hiện tại.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {history.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  {item.status === 'SUCCESS' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {item.status === 'DUPLICATE' && (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  {item.status === 'INVALID' && (
                    <XCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}

                  <div className="min-w-0">
                    <span className="font-mono font-bold text-slate-800 block truncate">
                      {item.ticketCode}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {item.message}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 block">{item.time}</span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      item.status === 'SUCCESS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'DUPLICATE'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
