"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  FolderOpen,
  Bug,
  MessageSquare,
  Shield,
  CreditCard,
  Database,
  LayoutDashboard,
  Github,
  FileImage,
  Building,
} from "lucide-react";

const adminRoutes = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Projects", href: "/admin/projects", icon: FolderOpen },
  { label: "Issues", href: "/admin/issues", icon: Bug },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Roles", href: "/admin/roles", icon: Shield },
  { label: "Transactions", href: "/admin/transactions", icon: CreditCard },
  { label: "GitHub Repos", href: "/admin/github_repositories", icon: Github },
  { label: "Media", href: "/admin/media", icon: FileImage },
  { label: "Products", href: "/admin/products", icon: Building },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {adminRoutes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href;
          
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon className="h-4 w-4" />
              {route.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}