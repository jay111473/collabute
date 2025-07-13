"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { MobileMenu } from "@/components/header/mobile-menu";

const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/our-solution", label: "Our Solution" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about-us", label: "About" },
  { href: "/contact-us", label: "Contact us" },
];

type HeaderProps = {
  isAuthenticated: boolean;
};

export function Header({ isAuthenticated }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full fixed top-0 left-0 right-0 z-[100] flex justify-center items-center">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:w-[90%] xl:w-[85%] 2xl:w-[80%] my-4">
        <div className="backdrop-blur-md bg-black/30 border border-white/[0.1] rounded-xl shadow-lg">
          <div className="container flex h-16 md:h-20 items-center px-4">
            {/* Logo */}
            <div className="flex-1 md:flex-[0.7]">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/logo.png"
                  alt="Collabute Logo"
                  width={40}
                  height={40}
                  className="h-8 md:h-10 w-auto"
                />
                <span className="text-lg md:text-xl font-semibold text-white">
                  Collabute
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex flex-[1.6] items-center justify-center">
              <div className="flex items-center space-x-8">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
            {!isAuthenticated ? (
              <div className="hidden md:flex flex-[0.7] items-center justify-end space-x-4">
                <Button
                  variant="outline"
                  className="px-4 py-2 bg-transparent border-white/20 text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/auth">Login</Link>
                </Button>
                <Button className="px-4 py-2" asChild>
                  <Link href="/auth/onboarding">Sign up</Link>
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex flex-[0.7] items-center justify-end space-x-4">
                <Button variant="primary" className="px-4 py-2" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </div>
            )}
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Component */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navigationLinks={navigationLinks}
      />
    </header>
  );
}

export default Header;
