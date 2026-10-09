import './globals.css';
import type { Metadata } from 'next';
import { RoleProvider } from '@/context/RoleContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Khaki Travel OS | Operations Cockpit & CRM',
  description: 'CRM, ERP, and Omnichannel Dispatch Hub for Khaki Tours Mumbai',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <RoleProvider>
          <AppShell>{children}</AppShell>
        </RoleProvider>
      </body>
    </html>
  );
}
