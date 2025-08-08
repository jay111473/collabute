"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function useAdminAuth() {
  const { signOut } = useAuthActions();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const adminStatus = useQuery(api.admin.getAdminStatus);

  // If not authenticated at all, definitely not admin
  if (!authLoading && !isAuthenticated) {
    return {
      isLoading: false,
      isAdmin: false,
      user: null,
      role: null,
      signOut,
    };
  }

  return {
    isLoading: authLoading || adminStatus === undefined,
    isAdmin: adminStatus?.isAdmin ?? false,
    user: adminStatus?.user ?? null,
    role: adminStatus?.role ?? null,
    signOut,
  };
}