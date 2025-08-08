"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Shield, ChevronDown, Settings } from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useRouter } from "next/navigation";

export function AdminHeader() {
  const { user, role, signOut } = useAdminAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/admin/login");
  };

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "AD";
  };

  return (
    <header className="h-16 bg-darkGray border-b border-grayBorders flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-medium text-white">
            Administrative Dashboard
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Account Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 px-3 py-2 h-auto hover:bg-darkGray2 border border-transparent hover:border-grayBorders rounded-lg transition-all duration-200"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image} alt={user?.name} />
                <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                  {getUserInitials(user?.name, user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-white leading-tight">
                  {user?.email || "muperdev@gmail.com"}
                </span>
                {role && (
                  <span className="text-xs text-gray-400 leading-tight">
                    {role.displayName || "Administrator"}
                  </span>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-64 bg-darkGray border-grayBorders shadow-lg"
          >
            <DropdownMenuLabel className="px-4 py-3 border-b border-grayBorders">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.image} alt={user?.name} />
                  <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                    {getUserInitials(user?.name, user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">
                    {user?.name || "Administrator"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {user?.email || "muperdev@gmail.com"}
                  </span>
                  {role && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-blue-600/20 text-blue-400 border-blue-600/30 mt-1 w-fit"
                    >
                      {role.displayName}
                    </Badge>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuItem
              className="px-4 py-3 cursor-pointer hover:bg-darkGray2 text-gray-300 hover:text-white"
              onClick={() => router.push("/admin/settings")}
            >
              <Settings className="h-4 w-4 mr-3" />
              Account Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-grayBorders" />

            <DropdownMenuItem
              className="px-4 py-3 cursor-pointer hover:bg-red-600/10 text-red-400 hover:text-red-300 focus:bg-red-600/10 focus:text-red-300"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
