"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  CircleDollarSign,
  Layers3,
  LayoutPanelLeft,
  Compass,
  Settings,
  CompassIcon,
  Plus,
  Package,
  Users,
  MessageSquareText,
  Search,
  UserPlus,
  FolderPlus,
  Zap,
  Home,
  FileText,
  CreditCard,
  UserCheck,
  Palette,
} from "lucide-react";
import { User } from "@/types/convex";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface CommandPaletteProps {
  user: User;
}

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
  keywords?: string[];
}

interface CommandGroup {
  heading: string;
  commands: Command[];
}

export function CommandPalette({ user }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  
  // Check if user has admin permissions
  const adminStatus = useQuery(api.admin.getAdminStatus);
  const isAdmin = adminStatus?.isAdmin ?? false;

  // Toggle command palette with Ctrl+K / Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }

      // ESC to close
      if (e.key === "Escape") {
        setOpen(false);
      }

      // Additional shortcuts
      if (open && e.key === "ArrowDown") {
        e.preventDefault();
      }
      if (open && e.key === "ArrowUp") {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  const navigateTo = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const openInNewTab = (url: string) => {
    setOpen(false);
    window.open(url, "_blank");
  };

  // Filter navigation items based on user type
  const getFilteredNavigation = (): Command[] => {
    const baseNavigation: Command[] = [
      {
        id: "nav-dashboard",
        label: "Dashboard",
        description: "Go to dashboard home",
        icon: LayoutPanelLeft,
        action: () => navigateTo("/dashboard"),
        keywords: ["home", "overview", "stats"],
      },
      {
        id: "nav-projects",
        label: "My Projects",
        description: "View and manage your projects",
        icon: Layers3,
        action: () => navigateTo("/dashboard/projects"),
        keywords: ["projects", "work", "development"],
      },
      {
        id: "nav-chat",
        label: "Chat",
        description: "Open messaging interface",
        icon: MessageSquareText,
        action: () => navigateTo("/dashboard/chat"),
        keywords: ["messages", "communication", "talk"],
      },
      {
        id: "nav-payments",
        label: "Payments",
        description: "View payment history and transactions",
        icon: CircleDollarSign,
        action: () => navigateTo("/dashboard/payments"),
        keywords: ["money", "transactions", "billing"],
      },
      {
        id: "nav-settings",
        label: "Settings",
        description: "Manage your account settings",
        icon: Settings,
        action: () => navigateTo("/dashboard/settings"),
        keywords: ["preferences", "account", "profile"],
      },
    ];

    // Add role-specific navigation
    if (user.type === "PROJECT_MANAGER") {
      baseNavigation.splice(2, 0, 
        {
          id: "nav-products",
          label: "Products",
          description: "Browse available products",
          icon: Package,
          action: () => navigateTo("/dashboard/products"),
          keywords: ["marketplace", "buy", "services"],
        },
        {
          id: "nav-explore",
          label: "Explore",
          description: "Discover new opportunities",
          icon: Compass,
          action: () => navigateTo("/dashboard/explore"),
          keywords: ["discover", "browse", "find"],
        },
        {
          id: "nav-leads",
          label: "Project Managers",
          description: "Connect with project managers",
          icon: CompassIcon,
          action: () => navigateTo("/dashboard/leads"),
          keywords: ["managers", "leads", "team"],
        },
        {
          id: "nav-developers",
          label: "Developers",
          description: "Find and connect with developers",
          icon: Users,
          action: () => navigateTo("/dashboard/developers"),
          keywords: ["team", "hire", "talent"],
        }
      );
    }

    return baseNavigation;
  };

    const commandGroups: CommandGroup[] = [
    {
      heading: "Navigation",
      commands: getFilteredNavigation(),
    },
    {
      heading: "Quick Actions",
      commands: [
        {
          id: "action-new-project",
          label: "Create New Project",
          description: "Start the project creation wizard",
          icon: Plus,
          action: () => navigateTo("/dashboard/wizard"),
          shortcut: "⌘N",
          keywords: ["new", "create", "wizard", "start"],
        },
        {
          id: "action-profile",
          label: "View Profile",
          description: "Go to your profile page",
          icon: UserCheck,
          action: () => navigateTo("/dashboard/profile"),
          keywords: ["profile", "user", "account", "me"],
        },
        {
          id: "action-kyc",
          label: "Complete KYC",
          description: "Complete your identity verification",
          icon: FileText,
          action: () => navigateTo("/dashboard/kyc"),
          keywords: ["verification", "identity", "kyc", "documents"],
        },
        {
          id: "action-search",
          label: "Search Projects",
          description: "Search for projects to explore",
          icon: Search,
          action: () => navigateTo("/dashboard/explore"),
          keywords: ["search", "find", "explore", "projects"],
        },
      ],
    },
    ...(isAdmin ? [{
      heading: "Admin Actions",
      commands: [
        {
          id: "admin-dashboard",
          label: "Admin Dashboard",
          description: "Access the admin panel",
          icon: Settings,
          action: () => navigateTo("/admin"),
          keywords: ["admin", "panel", "dashboard", "management"],
        },
        {
          id: "admin-users",
          label: "Manage Users",
          description: "View and manage user accounts",
          icon: Users,
          action: () => navigateTo("/admin/users"),
          keywords: ["users", "accounts", "manage", "admin"],
        },
        {
          id: "admin-projects",
          label: "Manage Projects",
          description: "Admin project management",
          icon: Layers3,
          action: () => navigateTo("/admin/projects"),
          keywords: ["projects", "admin", "manage"],
        },
        {
          id: "admin-roles",
          label: "Manage Roles",
          description: "Configure user roles and permissions",
          icon: UserCheck,
          action: () => navigateTo("/admin/roles"),
          keywords: ["roles", "permissions", "admin", "security"],
        },
        {
          id: "admin-transactions",
          label: "View Transactions",
          description: "Monitor payment transactions",
          icon: CreditCard,
          action: () => navigateTo("/admin/transactions"),
          keywords: ["transactions", "payments", "money", "admin"],
        },
      ],
    }] : []),
    {
      heading: "External Links",
      commands: [
        {
          id: "external-about",
          label: "About Us",
          description: "Learn more about Collabute",
          icon: Home,
          action: () => openInNewTab("/about-us"),
          keywords: ["about", "company", "info"],
        },
        {
          id: "external-blog",
          label: "Blog",
          description: "Read our latest articles",
          icon: FileText,
          action: () => openInNewTab("/blog"),
          keywords: ["blog", "articles", "news", "updates"],
        },
      ],
    },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {commandGroups.map((group, groupIndex) => (
          <div key={group.heading}>
            <CommandGroup heading={group.heading}>
              {group.commands.map((command) => (
                                 <CommandItem
                   key={command.id}
                   value={`${command.label} ${command.description} ${command.keywords?.join(" ") || ""}`}
                   onSelect={command.action}
                   className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                 >
                   <command.icon className="h-3.5 w-3.5 text-gray-400" />
                   <div className="flex flex-col flex-1 min-w-0">
                     <span className="text-sm font-medium text-white truncate">{command.label}</span>
                     {command.description && (
                       <span className="text-xs text-gray-500 truncate">{command.description}</span>
                     )}
                   </div>
                   {command.shortcut && (
                     <CommandShortcut className="text-xs text-gray-500 font-mono">{command.shortcut}</CommandShortcut>
                   )}
                 </CommandItem>
              ))}
            </CommandGroup>
            {groupIndex < commandGroups.length - 1 && <CommandSeparator />}
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

// Hook to manage command palette globally
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return { open, setOpen };
} 