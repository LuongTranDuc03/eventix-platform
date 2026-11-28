import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventApi } from '../../api/eventApi';
import { orderApi } from '../../api/orderApi';
import type { EventItem } from '../../types/event';
import { Zap, Clock, AlertCircle, CheckCircle2, Ticket, ChevronRight } from 'lucide-react';

export const WaitingRoomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const zoneId = searchParams.get('zoneId') || '';
  const initialQty = searchParams.get('qty') || '1';

  const [event, setEvent] = useState<EventItem | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [initialRank, setInitialRank] = useState<number>(10);
  const [passToken, setPassToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadEventAndJoinQueue(Number(id));
    }
  }, [id]);

  const loadEventAndJoinQueue = async (eventId: number) => {
    try {
      // 1. Tải thông tin sự kiện
      const eventRes = await eventApi.getEventDetail(eventId);
      if (eventRes.data) {
        setEvent(eventRes.data);
      }

      // 2. Tham gia hàng đợi phòng chờ ảo Redis ZSET
      const queueRes = await orderApi.joinQueue(eventId);
      const pos = queueRes.data || 8;
      setQueuePosition(pos);
      setInitialRank(Math.max(pos, 5));
    } catch (e: any) {
      setError(e?.message || 'Không thể kết nối vào phòng chờ. Vui lòng thử lại.');
    }
  };

  // Tiến trình mô phỏng van xả phòng chờ tự động tiến lên
  useEffect(() => {
    if (queuePosition === null || queuePosition <= 0 || passToken) return;

    const interval = setInterval(async () => {
      setQueuePosition((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          handleObtainPassToken();
          return 0;
        }
        return prev - 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [queuePosition, passToken]);

  // Cấp pass token khi đến lượt
  const handleObtainPassToken = async () => {
    if (!id || !user) return;
    try {
      const res = await orderApi.getPassToken(Number(id), user.userId);
      const token = res.data;
      setPassToken(token);

      // Tự động chuyển hướng sang trang chọn vé & giữ chỗ sau 1.5 giây
      setTimeout(() => {
        navigate(`/events/${id}/booking?passToken=${token}&zoneId=${zoneId}&qty=${initialQty}`);
      }, 1500);
    } catch (e: any) {
      setError(e?.message || 'Lỗi cấp vé thông hành phòng chờ.');
    }
  };

  const progressPercent = initialRank > 0 && queuePosition !== null
    ? Math.min(100, Math.round(((initialRank - queuePosition) / initialRank) * 100))
    : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900">
          Khám phá sự kiện
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to={`/events/${id}`} className="hover:text-slate-900 truncate max-w-xs">
          {event?.title || 'Sự kiện'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-medium">Phòng chờ ảo</span>
      </nav>

      {/* Main Waiting Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs text-center space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
            <Zap className="w-3.5 h-3.5" />
            Hệ thống Phòng chờ ảo (Redis ZSET FIFO)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Bạn đang trong hàng đợi săn vé
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Hệ thống đang điều phối lưu lượng truy cập để đảm bảo tính công bằng và chống sập trang.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            {error}
          </div>
        )}

        {passToken ? (
          <div className="p-6 rounded-lg bg-emerald-50 border border-emerald-200 text-center space-y-2 max-w-md mx-auto animate-in fade-in duration-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-sm text-emerald-900">ĐÃ ĐẾN LƯỢT BẠN!</h3>
            <p className="text-xs text-emerald-700">
              Đã nhận được Token thông hành. Đang tự động chuyển bạn vào trang chọn vé...
            </p>
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-5">
            {/* Position Display */}
            <div className="p-6 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Vị trí của bạn trong hàng đợi
              </span>
              <div className="text-4xl sm:text-5xl font-black text-indigo-700 font-mono tracking-tight">
                #{queuePosition !== null ? queuePosition : '...'}
              </div>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Ước tính thời gian chờ: ~{(queuePosition || 1) * 2} giây
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Tiến độ hàng đợi</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-500 rounded"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Queue Instructions */}
            <div className="p-4 rounded-md bg-amber-50 border border-amber-200 text-left text-xs text-amber-800 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 min-w-4" />
                Lưu ý quan trọng:
              </p>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-amber-900">
                <li>Không tải lại (F5) hoặc đóng tab để tránh bị mất vị trí trong hàng đợi.</li>
                <li>Mỗi phiên đăng nhập chỉ được cấp 01 mã Pass Token hợp lệ trong 15 phút.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Concert Info Preview */}
        {event && (
          <div className="pt-4 border-t border-slate-100 max-w-md mx-auto flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2 text-left truncate">
              <Ticket className="w-4 h-4 text-indigo-600 min-w-4" />
              <span className="font-medium text-slate-800 truncate">{event.title}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap pl-2">
              Sân Mỹ Đình
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
