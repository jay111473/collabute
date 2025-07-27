"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";

export function useAdminAuth() {
  const { signOut } = useAuthActions();
  const adminStatus = useQuery(api.admin.getAdminStatus);

  return {
    isLoading: adminStatus === undefined,
    isAdmin: adminStatus?.isAdmin ?? false,
    user: adminStatus?.user ?? null,
    role: adminStatus?.role ?? null,
    signOut,
  };
}