"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Shield } from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useRouter } from "next/navigation";

export function AdminHeader() {
  const { user, role, signOut } = useAdminAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/admin/login");
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <div className="flex flex-col">
              <span className="font-medium text-white">
                {user?.name || user?.email || "Admin"}
              </span>
              {role && (
                <Badge variant="secondary" className="text-xs bg-darkGray2 text-gray-300 border-grayBorders">
                  {role.displayName}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-red-400 hover:text-red-300 hover:bg-darkGray2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}