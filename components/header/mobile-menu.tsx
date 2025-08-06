"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationLinks: Array<{ href: string; label: string }>;
  pathname: string;
}

export function MobileMenu({
  isOpen,
  onClose,
  navigationLinks,
  pathname,
}: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay with blur effect */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Menu Panel with slide animation */}
          <motion.div
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-darkGray/95 backdrop-blur-xl border-l border-white/10 md:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Header with close button */}
            <motion.div
              className="flex items-center justify-between p-6 border-b border-white/10"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <span className="text-lg font-bold text-white">Menu</span>
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors relative group"
                aria-label="Close menu"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="h-6 w-6 text-white group-hover:text-purple-400 transition-colors duration-300" />
                <motion.div
                  className="absolute inset-0 bg-purple-500/20 rounded-full opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.2 }}
                />
              </motion.button>
            </motion.div>

            {/* Navigation with staggered animation */}
            <nav className="flex-1 px-6 pt-8 pb-8 overflow-y-auto">
              <div className="flex flex-col space-y-2">
                {navigationLinks.map((link, index) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          "relative block py-4 px-4 text-lg font-medium rounded-xl transition-all duration-300 group",
                          isActive
                            ? "text-purple-400 bg-purple-500/10"
                            : "text-white/80 hover:text-white hover:bg-white/5"
                        )}
                        onClick={onClose}
                      >
                        <span className="relative z-10 flex items-center">
                          {link.label}
                          {isActive && (
                            <motion.div
                              className="ml-2 h-2 w-2 bg-purple-400 rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.5 }}
                            />
                          )}
                        </span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100"
                          transition={{ duration: 0.2 }}
                        />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </nav>

            {/* Actions with enhanced styling */}
            <motion.div
              className="border-t border-white/10 p-6 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                variant="outline"
                className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300"
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg shadow-purple-500/25"
                asChild
              >
                <Link href="/onboarding">Sign up</Link>
              </Button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
