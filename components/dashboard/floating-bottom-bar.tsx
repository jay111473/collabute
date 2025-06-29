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
  Menu,
  Package,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@/types/dashboard";
import { toast } from "sonner";
import { deleteCookie, getCookie } from "cookies-next";
import axios from "axios";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FloatingBottomBarProps {
  user: User;
}

export default function FloatingBottomBar({ user }: FloatingBottomBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Debug: Log user information
  console.log("FloatingBottomBar - User object:", user);
  console.log("FloatingBottomBar - User type:", user?.type);

  const allNavItems = [
    {
      name: "Home",
      shortName: "Home",
      icon: LayoutPanelLeft,
      path: "/dashboard",
      type: "cross",
      priority: 1,
    },
    {
      name: "Explore",
      shortName: "Explore",
      icon: Compass,
      path: "/dashboard/explore",
      type: "developer",
      priority: 2,
    },
    {
      name: "Products",
      shortName: "Products",
      icon: Package,
      path: "/dashboard/products",
      type: "startup",
      priority: 2,
    },
    {
      name: "Projects",
      shortName: "Projects",
      icon: Layers3,
      path: "/dashboard/projects",
      type: "cross",
      priority: 3,
    },
    {
      name: "Project Managers",
      shortName: "Managers",
      icon: CompassIcon,
      path: "/dashboard/leads",
      type: "startup",
      priority: 3,
    },
    {
      name: "Payments",
      shortName: "Pay",
      icon: CircleDollarSign,
      path: "/dashboard/payments",
      type: "cross",
      priority: 4,
    },
    {
      name: "New Project",
      shortName: "New",
      icon: Plus,
      path: "/dashboard/wizard",
      type: "cross",
      priority: 5,
    },
    {
      name: "Settings",
      shortName: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
      type: "cross",
      priority: 6,
    },
  ];

  // Filter navigation items based on user type
  const filteredNavItems = allNavItems.filter(
    (item) => item.type === "cross" || item.type === user.type
  );

  // Debug: Log filtered items
  console.log("FloatingBottomBar - Filtered nav items:", filteredNavItems);
  console.log("FloatingBottomBar - All nav items for startup:", allNavItems.filter(item => item.type === "startup"));

  // Sort by priority and take first 4 for main bar
  const sortedItems = filteredNavItems.sort((a, b) => a.priority - b.priority);
  const mainBarItems = sortedItems.slice(0, 4);
  const dropdownItems = sortedItems.slice(4);

  const handleLogout = async () => {
    try {
      const token = getCookie("token");
      
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      deleteCookie("token");
      deleteCookie("isLoggedIn");
      toast.success("Successfully logged out");
      router.push("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };



      return (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        {/* Subtle glow backdrop */}
        <div className="absolute inset-0 bg-white/10 rounded-full blur-xl scale-110 -z-10" />
        <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-full px-8 py-4 shadow-2xl shadow-white/10">
          <div className="flex items-center gap-8">
            {/* Dropdown menu for additional items */}
            {dropdownItems.length > 0 && (
              <>
                <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <button className="px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium text-white/60 hover:text-white flex items-center gap-2">
                      <Menu className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    align="center"
                    className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl mb-2"
                  >
                    {dropdownItems.map((item) => (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link
                          href={item.path}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 text-sm transition-colors cursor-pointer",
                            pathname === item.path
                              ? "bg-white/20 text-white"
                              : "text-white/70 hover:text-white hover:bg-white/10"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem asChild>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Separator line */}
                <div className="h-6 w-px bg-white/20" />
              </>
            )}

            {/* Main navigation items */}
            {mainBarItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={cn(
                  "px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium whitespace-nowrap",
                  pathname === item.path
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
} 