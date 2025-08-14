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
  Package,
  Users,
  MessageSquareText,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useLinkStatus } from "next/link";
import { User } from "@/types/convex";
import { useAuthActions } from "@convex-dev/auth/react";

// Loading indicator component for navigation with debouncing
const NavigationLoadingIndicator = () => {
  const { pending } = useLinkStatus();
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;

    if (pending) {
      // Show spinner after 100ms delay to avoid flashing on fast navigation
      timeout = setTimeout(() => setShowSpinner(true), 100);
    } else {
      setShowSpinner(false);
      if (timeout) clearTimeout(timeout);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [pending]);

  if (!showSpinner) return null;

  return (
    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
      <div className="w-3 h-3 border border-darkPrimary border-t-transparent rounded-full animate-spin opacity-0 animate-[fadeIn_300ms_100ms_forwards,spin_1s_linear_infinite]" />
    </div>
  );
};

// Enhanced Link component with loading state
const SidebarLink = ({
  href,
  children,
  className,
  isActive,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  isActive: boolean;
}) => {
  return (
    <Link
      href={href}
      prefetch={true} // Enable prefetching
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-sm",
        isActive
          ? "bg-gray-500/20 text-darkPrimary"
          : "text-white hover:text-darkPrimary",
        className
      )}
    >
      {children}
      <NavigationLoadingIndicator />
    </Link>
  );
};

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const navItems = [
    {
      name: "Dashboard",
      icon: LayoutPanelLeft,
      path: "/dashboard",
      type: "cross",
    },
    {
      name: "Products",
      icon: Package,
      path: "/dashboard/products",
      type: "STARTUP",
    },
    {
      name: "My Projects",
      icon: Layers3,
      path: "/dashboard/projects",
      type: "cross",
    },
    {
      name: "Explore",
      icon: Compass,
      path: "/dashboard/explore",
      type: "DEVELOPER",
    },
    {
      name: "Explore",
      icon: CompassIcon,
      path: "/dashboard/leads",
      type: "STARTUP",
    },
    {
      name: "Developers",
      icon: Users,
      path: "/dashboard/developers",
      type: "PROJECT_MANAGER",
    },
    {
      name: "Chat",
      icon: MessageSquareText,
      path: "/dashboard/chat",
      type: "cross",
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
    (item) =>
      item.type === "cross" ||
      item.type === user.type ||
      (item.type === "DEVELOPER" && user.type === "PROJECT_MANAGER") ||
      (item.type === "STARTUP" && user.type === "PROJECT_MANAGER")
  );
  return (
    <div className="flex flex-col h-full bg-black">
      <div className="md:flex md:items-center md:justify-start md:gap-x-2 md:px-6 md:pt-4 md:pb-12 md:border-b md:border-white/10 hidden">
        <Link
          className="flex flex-col items-center justify-center gap-x-2 w-full"
          href={"/"}
          prefetch={true}
        >
          <Image src="/logo.png" alt="logo" width={40} height={40} />
          <h1 className="text-lg font-bold text-white">Collabute</h1>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start p-2 text-sm font-medium lg:px-4 gap-y-2">
          <Link
            href={"/dashboard/wizard"}
            prefetch={true}
            className={`relative flex items-center gap-3 rounded-lg p-3 transition-all text-sm bg-darkPrimary text-black`}
          >
            <Plus className="h-4 w-4" />
            New Project
            <NavigationLoadingIndicator />
          </Link>
          {filteredNavItems.map((item) => (
            <SidebarLink
              key={item.name}
              href={item.path}
              isActive={pathname === item.path}
              className="text-sm"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </SidebarLink>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => void signOut()}
          className="flex items-center gap-3 rounded-lg px-3 py-2 w-full text-sm text-white hover:text-red-400 transition-all disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
