import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { eventApi } from '../../api/eventApi';
import { orderApi } from '../../api/orderApi';
import type { EventItem, Zone } from '../../types/event';
import type { OrderResponse } from '../../types/order';
import { CountdownTimer } from '../../components/common/CountdownTimer';
import {
  Ticket,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

export const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const passToken = searchParams.get('passToken') || '';
  const initialZoneId = searchParams.get('zoneId') || '';
  const initialQty = Number(searchParams.get('qty')) || 1;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [quantity, setQuantity] = useState<number>(initialQty);

  // Trạng thái giữ vé
  const [holding, setHolding] = useState<boolean>(false);
  const [heldOrder, setHeldOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadEvent(Number(id));
    }
  }, [id]);

  const loadEvent = async (eventId: number) => {
    setLoading(true);
    try {
      const res = await eventApi.getEventDetail(eventId);
      if (res.data) {
        setEvent(res.data);
        if (res.data.zones && res.data.zones.length > 0) {
          const matchedZone = res.data.zones.find((z) => z.id === Number(initialZoneId));
          setSelectedZone(matchedZone || res.data.zones[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load event:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Hành động Giữ vé chịu tải cao (Hold Ticket)
  const handleHoldTicket = async () => {
    if (!event || !selectedZone) return;
    setError(null);
    setHolding(true);

    try {
      const res = await orderApi.holdTickets({
        eventId: event.id,
        zoneId: selectedZone.id,
        quantity,
        passToken,
      });

      if (res && res.data) {
        setHeldOrder(res.data);
      }
    } catch (err: any) {
      console.error('Hold ticket error:', err);
      setError(
        err?.message ||
          'Không thể giữ vé. Có thể khu vực này vừa hết vé hoặc bạn đang có đơn hàng chờ thanh toán.'
      );
    } finally {
      setHolding(false);
    }
  };

  // Hủy giữ vé
  const handleCancelOrder = async () => {
    if (!heldOrder) return;
    try {
      await orderApi.cancelOrder(heldOrder.id);
      setHeldOrder(null);
      setError(null);
    } catch (e) {
      console.error('Failed to cancel order:', e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Đang tải dữ liệu phiên mua vé...</p>
      </div>
    );
  }

  // Chặn nếu không có passToken
  if (!passToken) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-xs space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Thiếu Mã Thông Hành Phòng Chờ</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Để đảm bảo công bằng cho hàng ngàn người đang săn vé, bạn cần phải xếp hàng qua Phòng chờ ảo để nhận Pass-Token trước.
          </p>
          <Link
            to={`/events/${id}/waiting-room`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
          >
            Vào phòng chờ xếp hàng ngay
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const maxAllowed = event?.maxTicketsPerUser || 4;
  const totalPrice = selectedZone ? selectedZone.price * quantity : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900">
          Khám phá sự kiện
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to={`/events/${id}`} className="hover:text-slate-900 truncate max-w-xs">
          {event?.title || 'Chi tiết sự kiện'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-medium">Xác nhận Giữ vé</span>
      </nav>

      {/* Main Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Form & Zone details */}
        <div className="md:col-span-2 space-y-5">
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold mb-1 inline-block">
                PASS TOKEN HỢP LỆ
              </span>
              <h1 className="text-lg font-bold text-slate-900">{event?.title}</h1>
              <p className="text-xs text-slate-500 mt-0.5">Địa điểm: {event?.venue}</p>
            </div>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 min-w-4" />
              <div>
                <p className="font-semibold">Không thể hoàn tất giữ vé:</p>
                <p className="mt-0.5 text-rose-600">{error}</p>
              </div>
            </div>
          )}

          {/* Success Reservation Card (When Held) */}
          {heldOrder ? (
            <div className="bg-white border-2 border-emerald-500/80 rounded-lg p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">GIỮ VÉ THÀNH CÔNG</h3>
                    <p className="text-[11px] text-slate-500">Mã đơn hàng: {heldOrder.orderCode}</p>
                  </div>
                </div>

                {/* 10 Minute Countdown Timer */}
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Thời gian giữ vé còn lại
                  </span>
                  <CountdownTimer
                    expiresAt={heldOrder.expiresAt}
                    onExpire={() => {
                      setError('Đơn hàng giữ chỗ đã hết hạn 10 phút và tự động hoàn trả vào kho.');
                      setHeldOrder(null);
                    }}
                  />
                </div>
              </div>

              {/* Order Summary Specs */}
              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Khu vực vé:</span>
                  <span className="font-semibold text-slate-900">{selectedZone?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số lượng:</span>
                  <span className="font-semibold text-slate-900">{heldOrder.quantity} vé</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-900">Tổng tiền cần thanh toán:</span>
                  <span className="font-extrabold text-sm text-indigo-700">
                    {formatPrice(heldOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => navigate(`/checkout/${heldOrder.id}`)}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  Tiến hành Thanh toán ngay
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Hủy giữ vé
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                Sau 10 phút nếu chưa hoàn tất thanh toán, hệ thống sẽ tự động hoàn vé vào kho qua Redis Lua Script.
              </p>
            </div>
          ) : (
            /* Ticket Selection Form */
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                1. Chọn phân khu vé (Zone)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {event?.zones.map((zone) => {
                  const isSelected = selectedZone?.id === zone.id;
                  const isSoldOut = zone.availableCapacity <= 0;
                  return (
                    <div
                      key={zone.id}
                      onClick={() => !isSoldOut && setSelectedZone(zone)}
                      className={`p-3 rounded-md border text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                          : isSoldOut
                          ? 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900 truncate">{zone.name}</span>
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {zone.zoneType === 'STANDING' ? 'Đứng' : 'Ngồi'}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-indigo-700">{formatPrice(zone.price)}</p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Còn lại: {zone.availableCapacity.toLocaleString()} vé
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                  2. Chọn số lượng vé
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 text-xs font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-mono font-bold text-slate-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(maxAllowed, quantity + 1))}
                      disabled={quantity >= maxAllowed || (selectedZone ? quantity >= selectedZone.availableCapacity : false)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 text-xs font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-500">
                    (Giới hạn tối đa {maxAllowed} vé/người)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary & Hold Button */}
        <div className="md:col-span-1">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Tóm tắt đặt chỗ
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Khu vực:</span>
                <span className="font-semibold text-slate-800">{selectedZone?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Đơn giá:</span>
                <span>{selectedZone ? formatPrice(selectedZone.price) : '0 đ'}</span>
              </div>
              <div className="flex justify-between">
                <span>Số lượng:</span>
                <span className="font-semibold text-slate-800">{quantity} vé</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Tổng cộng:</span>
                <span className="text-indigo-700 font-extrabold">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {!heldOrder && (
              <button
                onClick={handleHoldTicket}
                disabled={holding || !selectedZone || selectedZone.availableCapacity <= 0}
                className="w-full mt-2 py-2.5 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {holding ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Ticket className="w-4 h-4" />
                    Xác nhận Giữ vé (10 phút)
                  </>
                )}
              </button>
            )}

            <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Cơ chế kỹ thuật:
              </p>
              <p>
                Trừ kho nguyên tử tức thì bằng <strong>Redis Lua Script</strong>. Đơn hàng được giữ chỗ trong <strong>10 phút</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
