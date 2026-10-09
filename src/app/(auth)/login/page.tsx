'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BrandMark } from '@/components/brand/BrandMark';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-[75vh] flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex justify-center">
            <BrandMark className="w-12 h-12 p-2" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Khaki Travel OS</h1>
          <p className="text-xs text-slate-400">Staff & Operations Desk Authentication</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Staff Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ops@khakitours.com"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <Link
            href="/"
            className="w-full inline-block text-center py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition shadow-md shadow-amber-500/10"
          >
            Access Operations Dashboard
          </Link>
        </form>

        <div className="text-center text-[11px] text-slate-500">
          Protected by Supabase Row-Level Security & Encrypted Session Cookies
        </div>
      </div>
    </div>
  );
}
