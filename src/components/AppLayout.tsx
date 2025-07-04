'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  
  // Don't show sidebar on login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return <Sidebar>{children}</Sidebar>;
}