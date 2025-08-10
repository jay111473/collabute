'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import Footer from '@/components/footer';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Check if current path should hide header and footer
  const shouldHideHeaderFooter = pathname?.startsWith('/admin') || 
                                pathname?.startsWith('/dashboard') || 
                                pathname?.startsWith('/onboarding') || 
                                pathname?.startsWith('/login');
  
  return (
    <div className={shouldHideHeaderFooter ? 'h-full' : ''}>
      {!shouldHideHeaderFooter && <Header />}
      {children}
      {!shouldHideHeaderFooter && <Footer />}
    </div>
  );
} 