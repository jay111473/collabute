'use client'

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"

const navigationLinks = [
  { href: '/', label: 'Home' },
  { href: '/our-solution', label: 'Our Solution' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/about', label: 'About' },
  { href: '/contact-us', label: 'Contact us' },
]

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="w-full fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 my-4">
        <div className="backdrop-blur-md bg-black/30 border border-white/[0.1] rounded-xl shadow-lg">
          <div className="container flex h-20 items-center">
            {/* Logo - visible on all screens */}
            <div className="flex-1 md:flex-[0.7]">
              <Link href="/" className="flex items-center space-x-2">
                <Image 
                  src="/logo.svg" 
                  alt="Collabute Logo" 
                  width={40} 
                  height={40}
                  className="h-10 w-auto"
                />
                <span className="text-xl font-semibold text-white">Collabute</span>
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

            {/* Desktop Buttons */}
            <div className="hidden md:flex flex-[0.7] items-center justify-end space-x-4">
              <Button 
                variant="outline" 
                className="px-4 py-2 bg-transparent border-white/20 text-white hover:bg-white/10" 
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button 
                variant="primary" 
                className="px-4 py-2" 
                asChild
              >
                <Link href="/start-project">Start your project</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>

            {/* Mobile Menu Overlay */}
            <div
              className={cn(
                "fixed inset-0 backdrop-blur-sm bg-black/20 z-50 md:hidden transition-opacity duration-300",
                isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <div
              className={cn(
                "fixed right-0 top-0 h-full w-[75%] max-w-sm z-50 md:hidden",
                "transform transition-transform duration-300 ease-in-out",
                "flex flex-col p-6",
                "backdrop-blur-xl bg-black/50 border-l border-white/[0.1]",
                isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
              )}
            >
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              <nav className="flex flex-col space-y-4">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium text-white/80 hover:text-white py-2 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full bg-transparent border-white/20 text-white hover:bg-white/10" 
                  asChild
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button 
                  variant="primary" 
                  className="w-full" 
                  asChild
                >
                  <Link href="/start-project">Start your project</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
