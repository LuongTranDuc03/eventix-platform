import React from 'react';
import { Link } from 'react-router-dom';
import type { EventItem } from '../../types/event';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';

interface EventCardProps {
  event: EventItem;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  // Format price helper
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  // Find lowest price
  const minPrice = event.zones && event.zones.length > 0
    ? Math.min(...event.zones.map((z) => Number(z.price)))
    : 0;

  // Total available tickets
  const totalAvailable = event.zones && event.zones.length > 0
    ? event.zones.reduce((sum, z) => sum + (z.availableCapacity || 0), 0)
    : 0;

  return (
    <div className="rounded-lg bg-white border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between">
      <div>
        {/* Banner Image */}
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
          <img
            src={event.bannerUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-white/90 backdrop-blur-xs text-slate-800 border border-slate-200 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Đang mở bán
            </span>
          </div>

          <div className="absolute bottom-2.5 right-2.5">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-900/80 text-white backdrop-blur-xs">
              Còn {totalAvailable.toLocaleString()} vé
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4">
          <h3 className="font-bold text-sm text-slate-900 line-clamp-2 mb-2" title={event.title}>
            {event.title}
          </h3>

          <div className="space-y-1.5 text-xs text-slate-500 mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 min-w-3.5" />
              <span className="truncate">{formatDate(event.salesStartTime)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 min-w-3.5" />
              <span className="truncate" title={event.venue}>{event.venue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Giá từ</span>
          <span className="text-sm font-bold text-indigo-700">
            {minPrice > 0 ? formatPrice(minPrice) : 'Liên hệ'}
          </span>
        </div>

        <Link
          to={`/events/${event.id}`}
          className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
        >
          Mua vé
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
