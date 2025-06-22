"use client";

import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/dashboard/Sidebar";
import FloatingBottomBar from "@/components/dashboard/floating-bottom-bar";
import Header from "@/components/dashboard/Header";
import Image from "next/image";
import { User } from "@/types/dashboard";
import { useFloatingNav } from "@/lib/hooks/use-floating-nav";

interface DashboardLayoutProps {
  user: User;
  children: React.ReactNode;
  title?: string;
}

const DashboardLayout = ({
  user,
  children,
  title = "Dashboard",
}: DashboardLayoutProps) => {
  const { isFloatingNavEnabled } = useFloatingNav();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Close the mobile menu when switching to desktop view
  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile, isMobileMenuOpen]);

  if (!user) {
    return null;
  }

  // Render floating navigation layout
  if (isFloatingNavEnabled) {
    return (
      <>
        <div className="flex flex-col h-screen bg-black">
          <Header title={title} />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>

        {/* Floating Bottom Bar */}
        <FloatingBottomBar user={user} />
      </>
    );
  }

  // Render traditional sidebar layout
  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar - Visible on md+ screens */}
      <div className="hidden md:block border-r border-white/10 bg-black text-white w-1/5">
        <Sidebar user={user} />
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/80 z-40 md:hidden transition-opacity duration-300",
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Sidebar - Slides in from left */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-4/5 max-w-xs bg-black border-r border-white/10 md:hidden",
          "transform transition-transform duration-300 ease-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="logo" width={32} height={32} />
            <h1 className="text-lg font-bold text-white">Collabute</h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
        <div className="p-4">
          <Sidebar user={user} />
        </div>
      </div>

      <div className="flex flex-col bg-black w-full">
        <div className="relative flex items-center">
          {/* Hamburger Menu Button - Only on mobile */}
          <button
            className="md:hidden p-2 ml-4 my-3 rounded-lg bg-darkGray/80 text-white"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Header title={title} />
        </div>

        {/* Page content */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
