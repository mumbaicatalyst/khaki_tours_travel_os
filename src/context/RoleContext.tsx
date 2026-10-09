'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'MASTER_OPS' | 'GUEST_CONCIERGE' | 'FIELD_DISPATCH' | 'FINANCE_TALLY';

export interface RoleConfig {
  id: UserRole;
  label: string;
  shortTitle: string;
  userName: string;
  avatarBadge: string;
  description: string;
  primaryModules: string[];
  headerActionLabel: string;
  headerActionHref: string;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  MASTER_OPS: {
    id: 'MASTER_OPS',
    label: 'Master Ops Cockpit',
    shortTitle: 'Master Ops',
    userName: 'Bharat Gothoskar (Founder & CEO)',
    avatarBadge: '👑',
    description: 'Full system visibility, corporate escalations, master calendar & financial health.',
    primaryModules: ['dashboard', 'bookings', 'schedule', 'inbox', 'customers', 'marketing', 'corporate', 'bespoke', 'tours', 'guides', 'dispatch', 'manifests', 'finance', 'analytics', 'settings', 'international', 'automations'],
    headerActionLabel: '+ New Booking',
    headerActionHref: '/bookings',
  },
  GUEST_CONCIERGE: {
    id: 'GUEST_CONCIERGE',
    label: 'Guest Experience & Inbound SLA Desk',
    shortTitle: 'Guest Desk',
    userName: 'Priya S. (Lead Concierge)',
    avatarBadge: '📥',
    description: 'WhatsApp live conversations, 15-min SLA response, guest CRM & 1-click booking passes.',
    primaryModules: ['inbox', 'customers', 'marketing', 'bookings', 'bespoke'],
    headerActionLabel: '+ Guest Pass',
    headerActionHref: '/inbox',
  },
  FIELD_DISPATCH: {
    id: 'FIELD_DISPATCH',
    label: 'Field Ops & Guide Dispatch Desk',
    shortTitle: 'Field Ops',
    userName: 'Farhan K. (Dispatch Coordinator)',
    avatarBadge: '🧭',
    description: 'Master departure calendar, guide/jeep resource locking, live rosters & walker attendance.',
    primaryModules: ['schedule', 'guides', 'dispatch', 'manifests', 'tours'],
    headerActionLabel: '+ Add Departure',
    headerActionHref: '/schedule',
  },
  FINANCE_TALLY: {
    id: 'FINANCE_TALLY',
    label: 'Finance, GST & Tally Accounts Desk',
    shortTitle: 'Accounts Desk',
    userName: 'C.A. Mehta & Associates',
    avatarBadge: '💰',
    description: 'Tally Prime EOD XML generation, GST SAC 998554 splits, corporate invoices & FX ledger.',
    primaryModules: ['finance', 'corporate', 'bookings', 'international'],
    headerActionLabel: '📄 Tally Export',
    headerActionHref: '/finance',
  },
};

interface RoleContextValue {
  role: UserRole;
  setRole: (role: UserRole) => void;
  config: RoleConfig;
  showAllModules: boolean;
  setShowAllModules: (show: boolean) => void;
  isModuleVisible: (moduleId: string) => boolean;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('MASTER_OPS');
  const [showAllModules, setShowAllModules] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('khaki_user_role');
    if (saved && (saved in ROLE_CONFIGS)) {
      setRoleState(saved as UserRole);
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('khaki_user_role', newRole);
  };

  const config = ROLE_CONFIGS[role];

  const isModuleVisible = (moduleId: string) => {
    if (showAllModules || role === 'MASTER_OPS') return true;
    return config.primaryModules.includes(moduleId);
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        config,
        showAllModules,
        setShowAllModules,
        isModuleVisible,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return ctx;
}
