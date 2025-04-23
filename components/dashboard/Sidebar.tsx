"use client";

import {
  CircleDollarSign,
  Layers3,
  LayoutPanelLeft,
  Compass,
  Settings,
  CompassIcon,
  Plus,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@/types/dashboard";
import { toast } from "sonner";
import { deleteCookie, getCookie } from "cookies-next";
import axios from "axios";
import { cn } from "@/lib/utils";

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();

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

  const handleLogout = async () => {
    try {
      // Get token from cookies
      const token = getCookie("token");
      
      // Call the logout endpoint
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Remove cookies
      deleteCookie("token");
      deleteCookie("isLoggedIn");
      // Redirect to auth page
      toast.success("Successfully logged out");
      router.push("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="md:flex md:items-center md:justify-start md:gap-x-2 md:px-6 md:pt-4 md:pb-12 md:border-b md:border-white/10 hidden">
        <Link
          className="flex flex-col items-center justify-center gap-x-2 w-full"
          href={"/"}
        >
          <Image src="/logo.svg" alt="logo" width={40} height={40} />
          <h1 className="text-lg font-bold text-white">Collabute</h1>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start p-2 text-sm font-medium lg:px-4 gap-y-2">
          <Link
            href={"/wizard"}
            className={`flex items-center gap-3 rounded-lg p-3 transition-all text-sm bg-darkPrimary text-white`}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
          {filteredNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              prefetch={true}
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
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 w-full text-sm text-white hover:text-red-400 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
