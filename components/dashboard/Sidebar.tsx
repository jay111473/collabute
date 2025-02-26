"use client";

import {
  CircleDollarSign,
  Layers3,
  LayoutPanelLeft,
  Compass,
  Settings,
  CompassIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User } from "@/types/dashboard";

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      icon: LayoutPanelLeft,
      path: "/dashboard",
      type: "cross",
    },
    {
      name: "Explore",
      icon: Compass,
      path: "/dashboard/explore",
      type: "developer",
    },
    {
      name: "My Projects",
      icon: Layers3,
      path: "/dashboard/my-projects",
      type: "cross",
    },
    {
      name: "Project Leads",
      icon: CompassIcon,
      path: "/dashboard/leads",
      type: "startup",
    },
    {
      name: "Payments",
      icon: CircleDollarSign,
      path: "/dashboard/payments",
      type: "cross",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
      type: "cross",
    },
  ];

  // Filter navigation items based on user type
  const filteredNavItems = navItems.filter(
    (item) => item.type === "cross" || item.type === user.type
  );

  return (
    <div className="hidden border-r border-white/10 bg-black text-white md:block w-1/5">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex items-center justify-start gap-x-2 px-6 pt-4 pb-12 border-b border-white/10">
          <Link
            className="flex flex-col items-center justify-center gap-x-2 w-full"
            href={"/"}
          >
            <Image src="/logo.svg" alt="logo" width={40} height={40} />
            <h1 className="text-lg font-bold">Collabute</h1>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-y-2">
            {filteredNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-sm
                ${
                  pathname === item.path
                    ? "bg-gray-500/20 text-darkPrimary"
                    : "text-white hover:text-darkPrimary "
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
