'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import Footer from '@/components/footer';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Check if current path is admin or dashboard route
  const isAdminOrDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard');
  
  return (
    <>
      {!isAdminOrDashboard && <Header />}
      {children}
      {!isAdminOrDashboard && <Footer />}
    </>
  );
} 