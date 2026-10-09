'use client';

interface MarginSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  colorClass?: string;
}

export function MarginSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  colorClass = 'accent-amber-500',
}: MarginSliderProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-medium text-slate-300">
        <span>{label}</span>
        <span className="font-mono text-white">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full ${colorClass}`}
      />
    </div>
  );
}
