'use client';

interface OccupancyWidgetProps {
  tourTitle: string;
  totalSeats: number;
  availableSeats: number;
  departureTime: string;
}

export function OccupancyWidget({
  tourTitle,
  totalSeats,
  availableSeats,
  departureTime,
}: OccupancyWidgetProps) {
  const bookedSeats = totalSeats - availableSeats;
  const occupancyPercent = Math.round((bookedSeats / totalSeats) * 100);

  return (
    <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-white truncate max-w-[200px]">{tourTitle}</h4>
        <span className="text-[10px] text-slate-400 font-mono">{departureTime}</span>
      </div>

      <div>
        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
          <span>Occupancy</span>
          <span className="font-semibold text-white">{occupancyPercent}% ({bookedSeats}/{totalSeats} Pax)</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              occupancyPercent >= 90
                ? 'bg-red-500'
                : occupancyPercent >= 70
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${occupancyPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
