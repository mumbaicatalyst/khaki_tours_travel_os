'use client';

import { DispatchStatus } from '@/types/database';

interface ResponseMonitorProps {
  dispatchId: string;
  resourceType: string;
  targetPhone: string;
  status: DispatchStatus;
  sentAt: string;
  timeoutMinutes?: number;
  onAccept?: () => void;
  onDecline?: () => void;
}

export function DispatchResponseMonitor({
  resourceType,
  targetPhone,
  status,
  timeoutMinutes = 30,
  onAccept,
  onDecline,
}: ResponseMonitorProps) {
  return (
    <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          {resourceType}
        </span>
        <span className="text-[11px] font-mono text-slate-400">{targetPhone}</span>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">Status:</span>
        <span
          className={`font-bold ${
            status === 'ACCEPTED'
              ? 'text-emerald-400'
              : status === 'BROADCAST_SENT'
              ? 'text-amber-400'
              : 'text-slate-400'
          }`}
        >
          {status}
        </span>
      </div>

      {status === 'BROADCAST_SENT' && (
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
          <span className="text-[10px] text-amber-500">Auto-expires in {timeoutMinutes}m</span>
          <div className="flex gap-1.5">
            {onAccept && (
              <button
                onClick={onAccept}
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold"
              >
                Accept
              </button>
            )}
            {onDecline && (
              <button
                onClick={onDecline}
                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-semibold"
              >
                Decline
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
