import Link from "next/link";
import { CircleUser, Search, Command } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

interface HeaderProps {
  title?: string;
}

const triggerCommandPalette = () => {
  // Trigger the command palette by dispatching a keyboard event
  const event = new KeyboardEvent('keydown', {
    key: 'k',
    ctrlKey: true,
    bubbles: true
  });
  document.dispatchEvent(event);
};

const Header = ({ title = "Dashboard" }: HeaderProps) => {
  return (
    <header className="flex w-full h-14 justify-between items-center gap-4 border-b border-white/10 bg-black px-4 lg:h-[60px] lg:px-6 lg:py-8">
      <h3 className="text-lg font-semibold text-white md:ml-0 ml-3">{title}</h3>
      
      <div className="flex items-center gap-2">
        {/* Command Palette Hint */}
        <div 
          onClick={triggerCommandPalette}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-darkGray/50 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-gray-300 hover:border-white/20 transition-colors cursor-pointer"
        >
          <Command className="h-3 w-3" />
          <span>⌘K</span>
        </div>
        
        <Link href="/dashboard/profile">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-white/10 bg-transparent hover:bg-white/5"
          >
            <CircleUser className="h-5 w-5 text-white/60" />
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
