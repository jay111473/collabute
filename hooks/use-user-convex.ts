"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useUserConvex() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();

  const user = useQuery(
    api.userProfiles.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );

  // Loading if auth is loading, or if authenticated but query is still pending
  const loading = authLoading || (isAuthenticated && user === undefined);

  return {
    user: user || null,
    loading,
    error: null,
    refetch: () => {
      // Convex handles refetching automatically through reactivity
    },
  };
}

export function useAuthUser() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user, loading } = useUserConvex();

  return {
    user,
    session: isAuthenticated ? { user } : null,
    loading: isLoading || loading,
    error: null,
  };
}
