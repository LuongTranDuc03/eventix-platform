import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { paymentApi } from '../../api/paymentApi';
import { eventApi } from '../../api/eventApi';
import type { OrderResponse } from '../../types/order';
import type { EventItem, Zone } from '../../types/event';
import type { PaymentMethod } from '../../types/payment';
import { CountdownTimer } from '../../components/common/CountdownTimer';
import {
  CreditCard,
  QrCode,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Clock,
  Building,
  Copy,
  Check,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [zone, setZone] = useState<Zone | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('VIETQR');

  // Trạng thái xử lý thanh toán
  const [processing, setProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrderDetail(Number(orderId));
    }
  }, [orderId]);

  const loadOrderDetail = async (id: number) => {
    setLoading(true);
    try {
      const res = await orderApi.getOrderById(id);
      if (res.data) {
        setOrder(res.data);
        if (res.data.eventId) {
          const eventRes = await eventApi.getEventDetail(res.data.eventId);
          if (eventRes.data) {
            setEvent(eventRes.data);
            const matchedZone = eventRes.data.zones.find((z) => z.id === res.data.zoneId);
            if (matchedZone) setZone(matchedZone);
          }
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount?: number) => {
    if (!amount) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Xác nhận thanh toán
  const handleConfirmPayment = async () => {
    if (!order) return;
    setError(null);
    setProcessing(true);

    try {
      await paymentApi.simulatePayment(order.id);
      setPaymentSuccess(true);

      // Tự động chuyển hướng về trang Ví vé sau 2.5 giây khi RabbitMQ worker sinh vé
      setTimeout(() => {
        navigate('/my-tickets');
      }, 2500);
    } catch (err: any) {
      setError(err?.message || 'Thanh toán thất bại. Đơn hàng có thể đã hết hạn hoặc bị hủy.');
      setProcessing(false);
    }
  };

  // Hủy đơn hàng
  const handleCancel = async () => {
    if (!order) return;
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này? Vé sẽ được hoàn trả lại cho hệ thống.')) {
      try {
        await orderApi.cancelOrder(order.id);
        navigate(event ? `/events/${event.id}` : '/');
      } catch (err: any) {
        setError(err?.message || 'Lỗi khi hủy đơn hàng');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Đang tải cổng thanh toán bảo mật EventiX Pay...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">Không tìm thấy đơn hàng</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.</p>
        <Link to="/" className="text-xs font-semibold text-indigo-600 hover:underline">
          ← Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900">
          Khám phá
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to={event ? `/events/${event.id}` : '/'} className="hover:text-slate-900 truncate max-w-xs">
          {event?.title || 'Sự kiện'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-medium">Thanh toán đơn hàng</span>
      </nav>

      {/* Payment Processing Success Banner */}
      {paymentSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-5 text-emerald-900 space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold text-sm">THANH TOÁN THÀNH CÔNG!</h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Cổng thanh toán đã ghi nhận giao dịch. Thông điệp đã được gửi đến <strong>RabbitMQ Worker</strong> để tạo vé điện tử.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-white/70 p-2.5 rounded border border-emerald-200">
            <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Đang chuyển hướng bạn đến <strong>Ví vé của tôi</strong> để nhận mã QR...</span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Lỗi thanh toán:</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Payment Methods Selection */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header Info */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 inline-block mb-1">
                CỔNG THANH TOÁN BẢO MẬT
              </span>
              <h1 className="text-base font-bold text-slate-900">Phương thức thanh toán</h1>
              <p className="text-xs text-slate-500 mt-0.5">Chọn một trong các hình thức thanh toán trực tuyến bên dưới</p>
            </div>
            <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
          </div>

          {/* Payment Method Tabs */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedMethod('VIETQR')}
              className={`p-3 rounded-md border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                selectedMethod === 'VIETQR'
                  ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <QrCode className="w-5 h-5 text-indigo-600" />
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-bold">Khuyên dùng</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">VietQR Pro</span>
                <span className="text-[10px] text-slate-500 block">Quét mã 24/7 mọi ngân hàng</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('CREDIT_CARD')}
              className={`p-3 rounded-md border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                selectedMethod === 'CREDIT_CARD'
                  ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <CreditCard className="w-5 h-5 text-indigo-600 mb-2" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Thẻ Quốc Tế</span>
                <span className="text-[10px] text-slate-500 block">Visa, Mastercard, JCB</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('MOMO')}
              className={`p-3 rounded-md border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                selectedMethod === 'MOMO'
                  ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <Smartphone className="w-5 h-5 text-pink-600 mb-2" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Ví Điện Tử</span>
                <span className="text-[10px] text-slate-500 block">MoMo, ZaloPay, ShopeePay</span>
              </div>
            </button>
          </div>

          {/* Payment Method Details View */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            {selectedMethod === 'VIETQR' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <QrCode className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Chuyển khoản liên ngân hàng nhanh qua VietQR (Napas 247)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  {/* Mock VietQR Image */}
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-center space-y-2">
                    <div className="w-40 h-40 mx-auto bg-white border border-slate-200 rounded-md p-2 shadow-xs flex flex-col items-center justify-center">
                      <div className="grid grid-cols-6 gap-1 w-32 h-32 opacity-80">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-xs ${
                              (i % 2 === 0 && i % 3 === 0) || i % 7 === 0 || i === 0 || i === 5 || i === 30 || i === 35
                                ? 'bg-slate-900'
                                : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Mở ứng dụng Ngân hàng / Momo để quét mã
                    </span>
                  </div>

                  {/* Transfer Details */}
                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Ngân hàng thụ hưởng:</span>
                        <span className="font-bold text-slate-800">Techcombank (TCB)</span>
                      </div>
                      <Building className="w-4 h-4 text-slate-400" />
                    </div>

                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Số tài khoản:</span>
                        <span className="font-mono font-bold text-indigo-700">19038291038102</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard('19038291038102', 'acc')}
                        className="p-1 text-slate-500 hover:text-indigo-600 cursor-pointer"
                        title="Sao chép"
                      >
                        {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Chủ tài khoản:</span>
                        <span className="font-bold text-slate-800">CONG TY CO PHAN EVENTIX VIET NAM</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Nội dung chuyển khoản (bắt buộc):</span>
                        <span className="font-mono font-bold text-indigo-700">{order.orderCode}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(order.orderCode, 'code')}
                        className="p-1 text-slate-500 hover:text-indigo-600 cursor-pointer"
                        title="Sao chép"
                      >
                        {copiedField === 'code' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'CREDIT_CARD' && (
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Thanh toán bằng Thẻ Tín dụng / Ghi nợ quốc tế
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Số thẻ thanh toán</label>
                    <input
                      type="text"
                      disabled
                      value="4111 •••• •••• 8888 (Môi trường Thử nghiệm Sandbox)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-600 font-mono text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Hạn sử dụng</label>
                      <input
                        type="text"
                        disabled
                        value="12/28"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-600 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mã bảo mật CVV</label>
                      <input
                        type="password"
                        disabled
                        value="888"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-600 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'MOMO' && (
              <div className="space-y-3 text-center py-4">
                <Smartphone className="w-8 h-8 text-pink-600 mx-auto" />
                <h3 className="text-xs font-bold text-slate-800">Thanh toán qua Ví MoMo / ZaloPay</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Bạn có thể quét mã qua App MoMo hoặc nhấn nút <strong>Xác nhận thanh toán mô phỏng</strong> để hoàn tất đơn hàng tức thì.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Timer */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Chi tiết đơn hàng
            </h3>

            {/* Countdown timer */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Thời gian giữ chỗ thanh toán
              </span>
              <CountdownTimer
                expiresAt={order.expiresAt}
                onExpire={() => {
                  setError('Đơn hàng đã quá hạn 10 phút và bị hệ thống tự động hoàn kho.');
                }}
              />
            </div>

            {/* Spec lines */}
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã đơn hàng:</span>
                <span className="font-mono font-semibold text-slate-900">{order.orderCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sự kiện:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[150px]">{event?.title || 'Sự kiện'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Khu vực vé:</span>
                <span className="font-semibold text-slate-900">{zone?.name || `Phân khu #${order.zoneId}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số lượng:</span>
                <span className="font-semibold text-slate-900">{order.quantity} vé</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Tổng thanh toán:</span>
                <span className="text-indigo-700 font-extrabold">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleConfirmPayment}
              disabled={processing || paymentSuccess}
              className="w-full py-2.5 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {processing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Xác nhận Thanh toán (Mô phỏng)
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Cancel Button */}
            <button
              onClick={handleCancel}
              disabled={processing || paymentSuccess}
              className="w-full py-2 px-3 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-600 font-medium text-xs transition-colors cursor-pointer"
            >
              Hủy đơn hàng
            </button>

            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Vé được xuất bất đồng bộ qua RabbitMQ ngay sau khi tiền về.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

