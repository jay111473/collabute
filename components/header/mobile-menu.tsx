'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  navigationLinks: Array<{ href: string; label: string }>
}

export function MobileMenu({ isOpen, onClose, navigationLinks }: MobileMenuProps) {
  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black md:hidden transition-colors duration-300",
          isOpen ? "opacity-90 visible" : "opacity-0 invisible"
        )}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 w-full max-w-sm bg-black md:hidden",
          "transform transition-transform duration-300 ease-out",
          "flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close menu"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 pt-2 pb-8 overflow-y-auto">
          <div className="flex flex-col space-y-1">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-3 text-lg font-medium text-white/80 hover:text-white transition-colors"
                onClick={onClose}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Actions */}
        <div className="border-t border-white/10">
          <div className="px-6 py-4 space-y-3">
            <Button 
              variant="outline" 
              className="w-full bg-transparent border-white/20 text-white hover:bg-white/10" 
              asChild
            >
              <Link href="/auth">Login</Link>
            </Button>
            <Button 
              className="w-full" 
              asChild
            >
              <Link href="/auth/onboarding">Sign up</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
} 