import React from 'react';
import type { Zone } from '../../types/event';

interface ZoneStageMapProps {
  zones: Zone[];
  selectedZoneId?: number;
  onSelectZone?: (zoneId: number) => void;
}

export const ZoneStageMap: React.FC<ZoneStageMapProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
}) => {
  // Format price helper
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Color palette for zones
  const getZoneColor = (index: number, isSelected: boolean) => {
    const colors = [
      { bg: 'bg-indigo-100', text: 'text-indigo-900', border: 'border-indigo-300', active: 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-300' },
      { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-300', active: 'bg-purple-600 text-white border-purple-700 ring-2 ring-purple-300' },
      { bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-300', active: 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300' },
      { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300', active: 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300' },
      { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300', active: 'bg-amber-600 text-white border-amber-700 ring-2 ring-amber-300' },
    ];
    const c = colors[index % colors.length];
    return isSelected ? c.active : `${c.bg} ${c.text} ${c.border} hover:opacity-90`;
  };

  return (
    <div className="rounded-lg bg-white border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Sơ đồ phân khu sân khấu</h4>
          <p className="text-[11px] text-slate-500">Bấm vào khu vực để chọn vé tương ứng</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          Chế độ xem 2D
        </span>
      </div>

      {/* Stage Layout Visual */}
      <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-center">
        {/* Main Stage */}
        <div className="max-w-md mx-auto mb-6">
          <div className="py-2.5 rounded-md bg-slate-800 text-white text-xs font-bold tracking-widest uppercase shadow-xs">
            ★ SÂN KHẤU CHÍNH (MAIN STAGE) ★
          </div>
          <div className="w-12 h-3 bg-slate-400 mx-auto rounded-b"></div>
        </div>

        {/* Zones Layout Simulation */}
        <div className="max-w-md mx-auto space-y-2">
          {/* VIP Zones Front */}
          <div className="grid grid-cols-2 gap-2">
            {zones.slice(0, 2).map((zone, idx) => {
              const isSelected = selectedZoneId === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => onSelectZone && onSelectZone(zone.id)}
                  type="button"
                  className={`p-3 rounded-md border text-center transition-all cursor-pointer ${getZoneColor(idx, isSelected)}`}
                >
                  <p className="font-bold text-xs truncate">{zone.name}</p>
                  <p className="text-[10px] opacity-80 mt-0.5">{formatPrice(zone.price)}</p>
                  <span className="text-[9px] font-mono mt-1 block">
                    {zone.availableCapacity} / {zone.totalCapacity} vé
                  </span>
                </button>
              );
            })}
          </div>

          {/* Center Zones */}
          {zones.slice(2, 4).length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {zones.slice(2, 4).map((zone, idx) => {
                const isSelected = selectedZoneId === zone.id;
                return (
                  <button
                    key={zone.id}
                    onClick={() => onSelectZone && onSelectZone(zone.id)}
                    type="button"
                    className={`p-2.5 rounded-md border text-center transition-all cursor-pointer ${getZoneColor(idx + 2, isSelected)}`}
                  >
                    <p className="font-bold text-xs truncate">{zone.name}</p>
                    <p className="text-[10px] opacity-80 mt-0.5">{formatPrice(zone.price)}</p>
                    <span className="text-[9px] font-mono mt-1 block">
                      {zone.availableCapacity} / {zone.totalCapacity} vé
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Back General Admission */}
          {zones.slice(4).map((zone, idx) => {
            const isSelected = selectedZoneId === zone.id;
            return (
              <button
                key={zone.id}
                onClick={() => onSelectZone && onSelectZone(zone.id)}
                type="button"
                className={`w-full p-2.5 rounded-md border text-center transition-all cursor-pointer ${getZoneColor(idx + 4, isSelected)}`}
              >
                <p className="font-bold text-xs truncate">{zone.name}</p>
                <p className="text-[10px] opacity-80 mt-0.5">{formatPrice(zone.price)}</p>
                <span className="text-[9px] font-mono mt-1 block">
                  {zone.availableCapacity} / {zone.totalCapacity} vé
                </span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-indigo-500"></span>
            VIP / Fanzone (Đứng)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-purple-500"></span>
            Khán đài CAT 1 / CAT 2 (Ngồi)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
            General Admission (Tự do)
          </span>
        </div>
      </div>
    </div>
  );
};

