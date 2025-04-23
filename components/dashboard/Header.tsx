import Link from "next/link";
import { CircleUser } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

interface HeaderProps {
  title?: string;
}

const Header = ({ title = "Dashboard" }: HeaderProps) => {
  return (
    <header className="flex w-full h-14 justify-between items-center gap-4 border-b border-white/10 bg-black px-4 lg:h-[60px] lg:px-6 lg:py-8">
      <h3 className="text-lg font-semibold text-white md:ml-0 ml-3">{title}</h3>
      <Link href="/dashboard/profile">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-white/10 bg-transparent hover:bg-white/5"
        >
          <CircleUser className="h-5 w-5 text-white/60" />
        </Button>
      </Link>
    </header>
  );
};

export default Header;
