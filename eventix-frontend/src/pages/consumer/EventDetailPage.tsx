import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventApi } from '../../api/eventApi';
import type { EventItem, Zone } from '../../types/event';
import { ZoneStageMap } from '../../components/events/ZoneStageMap';
import {
  Calendar,
  MapPin,
  Ticket,
  ShieldCheck,
  ChevronRight,
  Clock,
  AlertCircle,
  Info,
  ArrowRight,
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (id) {
      loadEventDetail(Number(id));
    }
  }, [id]);

  const loadEventDetail = async (eventId: number) => {
    setLoading(true);
    try {
      const res = await eventApi.getEventDetail(eventId);
      if (res && res.data) {
        setEvent(res.data);
        if (res.data.zones && res.data.zones.length > 0) {
          setSelectedZone(res.data.zones[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load event detail:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleDateString('vi-VN', {
        weekday: 'long',
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Đang tải thông tin chi tiết sự kiện...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Không tìm thấy sự kiện</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">Sự kiện có thể đã bị xóa hoặc không còn tồn tại.</p>
        <Link to="/" className="text-xs text-indigo-600 hover:underline font-semibold">
          ← Quay về trang chủ
        </Link>
      </div>
    );
  }

  const totalPrice = selectedZone ? selectedZone.price * quantity : 0;
  const maxAllowed = event.maxTicketsPerUser || 4;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900">
          Khám phá sự kiện
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-medium truncate max-w-sm">{event.title}</span>
      </nav>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Event Details & Visuals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Banner Card */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="relative h-64 sm:h-80 w-full bg-slate-100">
              <img
                src={event.bannerUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80'}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white/95 backdrop-blur-xs text-xs font-bold text-slate-900 border border-slate-200 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Đang mở bán Flash-sale
                </span>
              </div>
            </div>

            <div className="p-6">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
                {event.title}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600 mt-0.5 min-w-4" />
                  <div>
                    <span className="font-semibold block text-slate-800">Thời gian mở bán:</span>
                    <span>{formatDate(event.salesStartTime)}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 mt-0.5 min-w-4" />
                  <div>
                    <span className="font-semibold block text-slate-800">Địa điểm tổ chức:</span>
                    <span>{event.venue}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Event Description */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-600" />
              Mô tả chi tiết sự kiện
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {event.description || 'Chưa có thông tin mô tả chi tiết cho sự kiện này.'}
            </p>
          </div>

          {/* Interactive Stage Layout Map */}
          <ZoneStageMap
            zones={event.zones}
            selectedZoneId={selectedZone?.id}
            onSelectZone={(zoneId) => {
              const found = event.zones.find((z) => z.id === zoneId);
              if (found) setSelectedZone(found);
            }}
          />

          {/* Regulations & Policies */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3 text-xs text-slate-600">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Quy định mua vé & Check-in tại cổng
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-500">
              <li>Mỗi tài khoản được phép mua tối đa <strong>{maxAllowed} vé</strong> trong một đợt mở bán.</li>
              <li>Sau khi chọn giữ chỗ, đơn hàng sẽ được bảo lưu trong <strong>10 phút</strong> trên hệ thống để bạn tiến hành thanh toán.</li>
              <li>Vé điện tử có chứa <strong>mã QR động độc nhất</strong>. Vui lòng không chụp ảnh màn hình chia sẻ lên mạng xã hội để tránh bị quét trùng lặp tại cổng.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Sticky Ticket Booking Selector */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-5">
            <div>
              <h3 className="font-bold text-sm text-slate-900 mb-0.5">Lựa chọn khu vực vé</h3>
              <p className="text-[11px] text-slate-500">Giá vé đã bao gồm VAT và phí dịch vụ</p>
            </div>

            {/* Zone Selector Radio Cards */}
            <div className="space-y-2">
              {event.zones.map((zone) => {
                const isSelected = selectedZone?.id === zone.id;
                const isSoldOut = zone.availableCapacity <= 0;
                return (
                  <div
                    key={zone.id}
                    onClick={() => !isSoldOut && setSelectedZone(zone)}
                    className={`p-3 rounded-md border transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                        : isSoldOut
                        ? 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">{zone.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {zone.zoneType === 'STANDING' ? 'Đứng' : 'Ngồi'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Còn {zone.availableCapacity.toLocaleString()} vé
                      </span>
                    </div>

                    <div className="text-right whitespace-nowrap">
                      <span className="font-bold text-xs text-indigo-700 block">
                        {formatPrice(zone.price)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quantity Selector */}
            {selectedZone && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Số lượng vé</span>
                  <span className="text-[10px] text-slate-400">Tối đa {maxAllowed} vé/người</span>
                </div>

                <div className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30 text-xs font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-mono font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(maxAllowed, quantity + 1))}
                    disabled={quantity >= maxAllowed || quantity >= selectedZone.availableCapacity}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30 text-xs font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Price Summary */}
            {selectedZone && (
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Khu vực đã chọn:</span>
                  <span className="font-medium text-slate-800">{selectedZone.name}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Đơn giá:</span>
                  <span>{formatPrice(selectedZone.price)} × {quantity}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Tổng thanh toán:</span>
                  <span className="text-indigo-700 font-extrabold">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            )}

            {/* Primary Action Button: Enter Waiting Room */}
            <button
              onClick={() => {
                // Navigate to Waiting Room in Phase 3
                navigate(`/events/${event.id}/waiting-room?zoneId=${selectedZone?.id}&qty=${quantity}`);
              }}
              disabled={!selectedZone || selectedZone.availableCapacity <= 0}
              className="w-full py-2.5 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              Tiến vào Phòng chờ ảo (Săn vé)
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Cơ chế xếp hàng công bằng FIFO bằng Redis ZSET</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
