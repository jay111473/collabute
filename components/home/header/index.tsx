"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import HeaderRow from "./header-row";

const Header = () => {
  return (
    <header className="bg-black w-full py-4">
      <div className="container mx-auto flex items-center justify-between">
        <HeaderRow 
          title="AI Sport coach, plans, meals" 
          subtitle="Yesterday"
        />
        <div className="flex items-center gap-4">
          <Button variant="outline" className="rounded-lg border-white/10">
            <Link href="/pricing">Pricing</Link>
          </Button>
          <Button variant="primary" className="rounded-lg">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header; 