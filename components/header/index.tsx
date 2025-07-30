"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileMenu } from "@/components/header/mobile-menu";

const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/solutions", label: "Our Solution" },
  { href: "/pricing", label: "Pricing" },
  { href: "/early-bird", label: "Early Bird" },
  { href: "/about-us", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className="w-full fixed top-0 left-0 right-0 z-[100] flex justify-center items-center"
    >
      <div className="w-full px-4 sm:px-6 md:px-8 lg:w-[90%] xl:w-[85%] 2xl:w-[80%] my-4">
        <motion.div
          className={`backdrop-blur-xl border rounded-2xl shadow-2xl transition-all duration-300 ${
            isScrolled
              ? "bg-background border-white/20 shadow-purple-500/10"
              : "bg-black/40 border-white/10"
          }`}
          animate={{
            scale: isScrolled ? 0.98 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="container flex h-14 md:h-20 items-center px-4 md:px-6">
            {/* Left Navigation Links */}
            <nav className="hidden md:flex items-center justify-center flex-1">
              <div className="flex items-center space-x-1">
                {navigationLinks.slice(0, 3).map((link, index) => {
                  const isActive = pathname === link.href;
                  return (
                    <div
                      key={link.href}
                    >
                      <Link
                        href={link.href}
                        className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group ${
                          isActive
                            ? "text-darkPrimary"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        <span className="relative z-10">{link.label}</span>
                        <motion.div
                          className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100"
                          transition={{ duration: 0.2 }}
                        />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </nav>

            {/* Logo at Center */}
            <div className="flex justify-center">
              <Link href="/" className="flex items-center space-x-3">
                <Image
                  src="/logo.png"
                  alt="Collabute Logo"
                  width={40}
                  height={40}
                  className="h-8 md:h-10 w-auto"
                />
                <span className="text-lg md:text-xl font-bold text-white">
                  Collabute
                </span>
              </Link>
            </div>

            {/* Right Navigation Links */}
            <nav className="hidden md:flex items-center justify-center flex-1">
              <div className="flex items-center space-x-1">
                {navigationLinks.slice(3, 6).map((link, index) => {
                  const isActive = pathname === link.href;
                  return (
                    <div
                      key={link.href}
                    >
                      <Link
                        href={link.href}
                        className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group ${
                          isActive
                            ? "text-darkPrimary"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        <span className="relative z-10">{link.label}</span>
                        <motion.div
                          className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100"
                          transition={{ duration: 0.2 }}
                        />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </nav>

            {/* Mobile Menu Button with animation */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 relative group"
              aria-label="Toggle menu"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <Menu className="h-6 w-6 text-white group-hover:text-purple-400 transition-colors duration-300" />
                <motion.div
                  className="absolute inset-0 bg-purple-500/20 rounded-full opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.2 }}
                />
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Mobile Menu Component */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            navigationLinks={navigationLinks}
            pathname={pathname}
          />
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Header;
