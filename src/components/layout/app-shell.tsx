'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Sidebar } from './sidebar';
import { HydrationGate } from '@/components/hydration-gate';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!loading && !isAuthenticated && !isLoginPage) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, isLoginPage, router]);

  if (loading) return null;

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-60 flex-1">
        <HydrationGate>{children}</HydrationGate>
      </main>
    </div>
  );
}
