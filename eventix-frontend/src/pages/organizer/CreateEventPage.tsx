import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { eventApi } from '../../api/eventApi';
import type { CreateZoneDto, CreateEventPayload } from '../../types/event';
import {
  CalendarPlus,
  Plus,
  Trash2,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();

  // Basic Info Form State
  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState(
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80'
  );

  // Sales Window (Default: starts tomorrow, ends 14 days later)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
  const nextTwoWeeks = new Date(Date.now() + 86400000 * 14).toISOString().slice(0, 16);

  const [salesStartTime, setSalesStartTime] = useState(tomorrow);
  const [salesEndTime, setSalesEndTime] = useState(nextTwoWeeks);
  const [maxTicketsPerUser, setMaxTicketsPerUser] = useState<number>(4);

  // Zones Builder
  const [zones, setZones] = useState<CreateZoneDto[]>([
    { name: 'VIP Lounge A (Fanzone)', zoneType: 'STANDING', price: 2500000, totalCapacity: 500 },
    { name: 'Khán đài CAT 1', zoneType: 'SEATED', price: 1500000, totalCapacity: 1200 },
    { name: 'Vé Đứng Phổ Thông (GA)', zoneType: 'STANDING', price: 800000, totalCapacity: 3000 },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Thêm phân khu mới
  const handleAddZone = () => {
    setZones([
      ...zones,
      {
        name: `Phân khu mới ${zones.length + 1}`,
        zoneType: 'STANDING',
        price: 500000,
        totalCapacity: 500,
      },
    ]);
  };

  // Xóa phân khu
  const handleRemoveZone = (index: number) => {
    if (zones.length <= 1) {
      alert('Sự kiện phải có ít nhất một phân khu vé.');
      return;
    }
    setZones(zones.filter((_, i) => i !== index));
  };

  // Cập nhật giá trị phân khu
  const handleZoneChange = (index: number, field: keyof CreateZoneDto, value: any) => {
    const updated = [...zones];
    updated[index] = { ...updated[index], [field]: value };
    setZones(updated);
  };

  // Tổng sức chứa & Tổng doanh thu tiềm năng
  const totalCapacity = zones.reduce((acc, z) => acc + (Number(z.totalCapacity) || 0), 0);
  const totalRevenue = zones.reduce(
    (acc, z) => acc + (Number(z.price) || 0) * (Number(z.totalCapacity) || 0),
    0
  );

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !venue.trim()) {
      setError('Vui lòng nhập đầy đủ Tiêu đề sự kiện và Địa điểm.');
      return;
    }

    if (zones.length === 0) {
      setError('Vui lòng cấu hình ít nhất một phân khu vé.');
      return;
    }

    setSubmitting(true);

    const payload: CreateEventPayload = {
      title: title.trim(),
      description: description.trim(),
      venue: venue.trim(),
      bannerUrl: bannerUrl.trim(),
      salesStartTime: new Date(salesStartTime).toISOString(),
      salesEndTime: new Date(salesEndTime).toISOString(),
      maxTicketsPerUser: Number(maxTicketsPerUser) || 4,
      zones: zones.map((z) => ({
        name: z.name.trim(),
        zoneType: z.zoneType,
        price: Number(z.price) || 0,
        totalCapacity: Number(z.totalCapacity) || 1,
      })),
    };

    try {
      await eventApi.createEvent(payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/organizer/events');
      }, 2000);
    } catch (err: any) {
      console.error('Create event error:', err);
      setError(
        err?.message || 'Không thể tạo sự kiện. Vui lòng kiểm tra lại quyền hạn hoặc dữ liệu nhập.'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Link to="/organizer/dashboard" className="hover:text-slate-900">
              Kênh Ban tổ chức
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-medium">Tạo sự kiện mới</span>
          </nav>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-indigo-600" />
            Khởi tạo Sự kiện & Cấu hình Phân khu vé
          </h1>
        </div>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h3 className="font-bold text-sm">TẠO SỰ KIỆN THÀNH CÔNG!</h3>
            <p className="text-xs text-emerald-700 mt-0.5">
              Sự kiện đã được gửi đến Quản trị viên (Admin) để kiểm duyệt và Pre-warm kho vé lên Redis. Đang chuyển hướng...
            </p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Lỗi tạo sự kiện:</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
            1. Thông tin chung về Sự kiện
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tên sự kiện / Tiêu đề <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Đại nhạc hội Rock Symphony 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Địa điểm tổ chức <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Sân vận động Quốc gia Mỹ Đình, Hà Nội"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-md border border-slate-300 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  URL Ảnh Banner sự kiện
                </label>
                <div className="relative">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-md border border-slate-300 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mô tả chi tiết sự kiện</label>
              <textarea
                rows={3}
                placeholder="Thông tin giới thiệu nghệ sĩ biểu diễn, quy định mang theo đồ đạc..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs focus:outline-none focus:border-indigo-600"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Section 2: Sales Window */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
            2. Cửa sổ Mở bán & Giới hạn mua vé
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Thời gian mở bán <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={salesStartTime}
                onChange={(e) => setSalesStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Thời gian kết thúc bán <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={salesEndTime}
                onChange={(e) => setSalesEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Vé tối đa / tài khoản
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={maxTicketsPerUser}
                onChange={(e) => setMaxTicketsPerUser(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Dynamic Zones Builder */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                3. Cấu hình Phân khu vé (Zone & Ticket Pricing)
              </h2>
              <p className="text-[11px] text-slate-500">
                Các phân khu sẽ được nạp trực tiếp vào Redis Cache sau khi Admin duyệt
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddZone}
              className="px-2.5 py-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm phân khu
            </button>
          </div>

          <div className="space-y-3">
            {zones.map((zone, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-md border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs"
              >
                <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0">
                  {idx + 1}
                </div>

                <div className="flex-1 w-full sm:w-auto">
                  <label className="block text-[10px] text-slate-500 mb-0.5">Tên phân khu</label>
                  <input
                    type="text"
                    required
                    value={zone.name}
                    onChange={(e) => handleZoneChange(idx, 'name', e.target.value)}
                    placeholder="VD: VIP A1, GA..."
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="w-full sm:w-32">
                  <label className="block text-[10px] text-slate-500 mb-0.5">Loại vé</label>
                  <select
                    value={zone.zoneType}
                    onChange={(e) => handleZoneChange(idx, 'zoneType', e.target.value as any)}
                    className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white text-xs focus:outline-none focus:border-indigo-600"
                  >
                    <option value="STANDING">Vé Đứng (GA)</option>
                    <option value="SEATED">Vé Ngồi (Ghế)</option>
                  </select>
                </div>

                <div className="w-full sm:w-36">
                  <label className="block text-[10px] text-slate-500 mb-0.5">Giá vé (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    required
                    value={zone.price}
                    onChange={(e) => handleZoneChange(idx, 'price', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs font-mono font-semibold focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="w-full sm:w-28">
                  <label className="block text-[10px] text-slate-500 mb-0.5">Số lượng vé</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={zone.totalCapacity}
                    onChange={(e) => handleZoneChange(idx, 'totalCapacity', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs font-mono focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveZone(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors self-end sm:self-center cursor-pointer"
                  title="Xóa phân khu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Capacity and Revenue KPI Preview */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-md border border-slate-200">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] text-slate-500 block">Tổng vé phát hành:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {totalCapacity.toLocaleString()} vé
                </span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-[10px] text-slate-500 block">Doanh thu tối đa dự kiến:</span>
                <span className="font-extrabold text-indigo-700 font-mono text-sm">
                  {formatPrice(totalRevenue)}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kho vé sẽ trừ nguyên tử qua Redis Lua Script</span>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/organizer/dashboard"
            className="px-4 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
          >
            Hủy bỏ
          </Link>

          <button
            type="submit"
            disabled={submitting || success}
            className="px-5 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <CalendarPlus className="w-4 h-4" />
                Hoàn tất & Gửi Phê Duyệt
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
