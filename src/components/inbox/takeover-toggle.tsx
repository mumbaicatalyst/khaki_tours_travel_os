'use client';

interface TakeoverToggleProps {
  isActive: boolean;
  onToggle: () => void;
  agentName?: string;
}

export function TakeoverToggle({ isActive, onToggle, agentName = 'Operations Staff' }: TakeoverToggleProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg">
      <div className="flex-1">
        <div className="text-xs font-bold text-white flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
          {isActive ? 'Human Live Takeover Active' : 'Automated Bot Handling'}
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {isActive
            ? `Bot auto-replies suppressed. Controlled by ${agentName}.`
            : 'Incoming leads routed automatically to intake & fast-path engine.'}
        </p>
      </div>

      <button
        onClick={onToggle}
        className={`px-3 py-1.5 rounded text-xs font-bold transition shadow-sm ${
          isActive
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
        }`}
      >
        {isActive ? 'Release to Bot' : 'Takeover (Jump-In)'}
      </button>
    </div>
  );
}
