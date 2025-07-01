"use client";

import { usePathname } from "next/navigation";
import AppLayout from "./AppLayout";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Pages that should not use the AppLayout (like login)
  const noLayoutPages = ['/login'];

  if (noLayoutPages.includes(pathname)) {
    return <>{children}</>;
  }

  return <AppLayout>{children}</AppLayout>;
}
