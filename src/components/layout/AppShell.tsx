'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole, ROLE_CONFIGS, UserRole } from '@/context/RoleContext';
import { BrandMark } from '@/components/brand/BrandMark';
import {
  LayoutDashboard,
  Ticket,
  Calendar,
  Inbox,
  Users,
  Building2,
  Compass,
  Landmark,
  ClipboardList,
  Coins,
  Globe2,
  Zap,
  ChevronDown,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  GraduationCap,
  BarChart3,
  Settings,
  Send,
} from 'lucide-react';

interface NavItem {
  id: string;
  name: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

const ALL_NAV_SECTIONS: {
  title: string;
  items: NavItem[];
}[] = [
  {
    title: 'Core Operations',
    items: [
      { id: 'dashboard', name: 'Dashboard Overview', href: '/', icon: LayoutDashboard },
      { id: 'bookings', name: 'Bookings & Orders', href: '/bookings', icon: Ticket },
      { id: 'schedule', name: 'Departures Calendar', href: '/schedule', icon: Calendar },
      { id: 'inbox', name: 'Unified Inbox & SLA', href: '/inbox', icon: Inbox },
    ],
  },
  {
    title: 'CRM & Growth Marketing',
    items: [
      { id: 'customers', name: 'Customers & CRM', href: '/customers', icon: Users },
      { id: 'marketing', name: 'Marketing & Campaigns', href: '/marketing', icon: Send },
      { id: 'corporate', name: 'Corporate B2B', href: '/corporate', icon: Building2 },
      { id: 'bespoke', name: 'Bespoke Tour Studio', href: '/bespoke', icon: Sparkles },
    ],
  },
  {
    title: 'Inventory & Field Ops',
    items: [
      { id: 'tours', name: 'Tours Catalog', href: '/tours', icon: Landmark },
      { id: 'guides', name: 'Guides & Allocation Pool', href: '/guides', icon: GraduationCap },
      { id: 'dispatch', name: 'Guide & Jeep Dispatch', href: '/dispatch', icon: Compass },
      { id: 'manifests', name: 'Guest Rosters & Attendance', href: '/manifests', icon: ClipboardList },
    ],
  },
  {
    title: 'Finance & System',
    items: [
      { id: 'finance', name: 'Finance & Tally EOD', href: '/finance', icon: Coins },
      { id: 'analytics', name: 'BI & Fleet Analytics', href: '/analytics', icon: BarChart3 },
      { id: 'settings', name: 'Operations Cost & DB', href: '/settings', icon: Settings },
      { id: 'international', name: 'International Expeditions', href: '/international', icon: Globe2 },
      { id: 'automations', name: 'Automations & Webhooks', href: '/automations', icon: Zap },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, setRole, config, showAllModules, setShowAllModules, isModuleVisible } = useRole();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased flex w-full">
      {/* Modern Operations Left Sidebar */}
      <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <BrandMark className="w-9 h-9 group-hover:border-[#c84a1c]/60 transition" />
            <div>
              <div className="font-extrabold tracking-tight text-white text-base leading-tight group-hover:text-amber-300 transition">
                KHAKI TOURS
              </div>
              <div className="text-[10px] uppercase text-[#c84a1c] font-bold tracking-wider">
                Travel OS &bull; Mumbai
              </div>
            </div>
          </Link>
        </div>

        {/* Active Role Quick Card in Sidebar */}
        <div className="px-3.5 pt-3 pb-1">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider flex items-center justify-between">
              <span>Active Workspace</span>
              <span className="text-amber-400 font-bold">{config.avatarBadge}</span>
            </div>
            <div className="text-xs font-bold text-white mt-0.5 truncate">{config.shortTitle}</div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">{config.userName}</div>
          </div>
        </div>

        {/* Dynamic Navigation Sections */}
        <nav className="flex-1 p-3.5 space-y-5 text-xs">
          {ALL_NAV_SECTIONS.map((section) => {
            // Filter items based on current role
            const visibleItems = section.items.filter((item) => isModuleVisible(item.id));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {section.title}
                </div>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg transition font-medium text-xs ${
                        isActive
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })}

          {/* Module Filter Toggle for Non-Master roles */}
          {role !== 'MASTER_OPS' && (
            <div className="pt-2 border-t border-slate-800/80 px-2">
              <button
                type="button"
                onClick={() => setShowAllModules(!showAllModules)}
                className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 py-1.5 transition"
              >
                <span className="flex items-center gap-1.5">
                  {showAllModules ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                  {showAllModules ? 'Show My Role Only' : 'Show All 12 Modules'}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {showAllModules ? 'Expanded' : 'Filtered'}
                </span>
              </button>
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
          <div className="font-semibold text-slate-400">Khaki Tours Pvt Ltd</div>
          <div>310 Hari Chambers, Fort</div>
          <div className="text-[10px] text-amber-500 font-mono">Operations Release v1.3</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Command Bar */}
        <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-40 px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Operations Command Center &bull; Fort, Mumbai
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Role / Workspace Persona Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-700/80 hover:border-slate-600 rounded-lg text-xs transition shadow-sm"
              >
                <span className="text-sm">{config.avatarBadge}</span>
                <div className="text-left">
                  <div className="font-semibold text-white leading-tight flex items-center gap-1">
                    {config.shortTitle}
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-[10px] text-slate-400 leading-none">{config.userName.split('(')[0].trim()}</div>
                </div>
              </button>

              {/* Role Switcher Dropdown Modal */}
              {roleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setRoleDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 space-y-1 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Switch Operating Role & Desk
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Tailors navigation & quick actions to each team member’s responsibilities.
                      </p>
                    </div>

                    {(Object.keys(ROLE_CONFIGS) as UserRole[]).map((rKey) => {
                      const item = ROLE_CONFIGS[rKey];
                      const isSelected = role === rKey;
                      return (
                        <button
                          key={rKey}
                          type="button"
                          onClick={() => {
                            setRole(rKey);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-lg transition flex items-start justify-between ${
                            isSelected
                              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                              : 'hover:bg-slate-800/80 text-slate-300 border border-transparent'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs flex items-center gap-1.5 text-white">
                              <span>{item.avatarBadge}</span>
                              <span>{item.label}</span>
                            </div>
                            <div className="text-[11px] text-amber-400/90 font-medium">
                              Staff: {item.userName}
                            </div>
                            <div className="text-[10px] text-slate-400 leading-snug">
                              {item.description}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0 ml-2 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Quick Action Button Adapted to Role */}
            <Link
              href={config.headerActionHref}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition text-xs shadow-sm flex items-center gap-1"
            >
              {config.headerActionLabel}
            </Link>

            {/* Global CRM Access Link */}
            <Link
              href="/customers"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded-lg transition text-xs"
            >
              + Customer CRM
            </Link>
          </div>
        </header>

        {/* Dynamic Content Viewport */}
        <main className="flex-1 min-h-0 p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
