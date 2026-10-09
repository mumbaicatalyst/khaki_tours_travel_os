'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BrandMark } from '@/components/brand/BrandMark';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRole, UserRole } from '@/context/RoleContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';
  const { setRole } = useRole();

  const [email, setEmail] = useState('ops@khakitours.com');
  const [password, setPassword] = useState('khaki2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const QUICK_ACCOUNTS = [
    { label: 'Bharat Gothoskar (CEO)', email: 'bharat@khakitours.com', role: 'MASTER_OPS' as UserRole, icon: '👑' },
    { label: 'Priya S. (Ops Lead)', email: 'priya@khakitours.com', role: 'GUEST_CONCIERGE' as UserRole, icon: '⚡' },
    { label: 'Kaevan Umrigar (Growth)', email: 'kaevan@khakitours.com', role: 'MARKETING_GROWTH' as UserRole, icon: '🚀' },
    { label: 'Farhan K. (Dispatch)', email: 'farhan@khakitours.com', role: 'FIELD_DISPATCH' as UserRole, icon: '🧭' },
  ];

  const handleSelectQuickAccount = (acc: typeof QUICK_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword('khaki2026!');
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid credentials. Please verify your email and password.');
        setLoading(false);
        return;
      }

      // Sync role
      if (data.user?.role) {
        setRole(data.user.role as UserRole);
      }

      // Store user metadata
      if (typeof window !== 'undefined') {
        localStorage.setItem('khaki_user', JSON.stringify(data.user));
      }

      // Redirect to destination
      router.push(redirectTarget);
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl space-y-6 backdrop-blur">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex justify-center">
            <BrandMark className="w-14 h-14 p-2 shadow-inner" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Khaki Travel OS</h1>
            <p className="text-xs text-[#c84a1c] font-bold uppercase tracking-wider mt-0.5">
              Authorized Operations Desk Access
            </p>
          </div>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Internal operations, concierge SLA responses, guide dispatches &amp; campaign studio.
          </p>
        </div>

        {/* Quick Staff Demo Chips */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-2">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Quick Staff One-Click Fill
            </span>
            <span className="text-slate-500 font-mono">Passcode: khaki2026!</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleSelectQuickAccount(acc)}
                className={`text-left px-2.5 py-1.5 rounded-lg border text-[11px] transition flex items-center gap-1.5 ${
                  email === acc.email
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{acc.icon}</span>
                <span className="truncate">{acc.label}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-rose-950/70 border border-rose-500/50 px-3.5 py-2.5 rounded-xl text-xs text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Staff Email Address</span>
              <span className="text-[10px] text-slate-500 font-normal">e.g. bharat@ / priya@ / kaevan@</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@khakitours.com"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Security Passcode</span>
              <span className="text-[10px] text-slate-500 font-normal">Fixed Access Key</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter authorized password"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter Operations Desk</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Cookie Token Secured
          </span>
          <span className="font-mono">v1.3 Fort Operations</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center text-xs text-slate-500 font-medium">
        Authenticating Khaki Travel OS...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
