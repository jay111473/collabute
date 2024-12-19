'use client'

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigationLinks = [
  { href: '/', label: 'Home' },
  { href: '/our-solution', label: 'Our Solution' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/about', label: 'About' },
  { href: '/contact-us', label: 'Contact us' },
]

export function Header() {
  return (
    <header className="w-full border border-gray-50 border-opacity-30 rounded-xl bg-transparent">
      <div className="container flex h-20 items-center">
        <div className="flex-[0.7]">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/logo.svg" 
              alt="Collabute Logo" 
              width={40} 
              height={40}
              className="h-10 w-auto"
            />
            <span className="text-xl font-semibold">Collabute</span>
          </Link>
        </div>

        <nav className="flex-[1.6] flex items-center justify-center">
          <div className="flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                  "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="flex-[0.7] flex items-center justify-end space-x-4">
          <Button variant="outline" className="px-4 py-2 !border-opacity-30" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="primary" className="px-4 py-2" asChild>
            <Link href="/start-project">Start your project</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
