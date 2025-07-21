"use client";

import { useQuery } from "convex/react";
import { useSession } from "@/lib/auth-client";
import { api } from "@/convex/_generated/api";

function transformConvexUserToUser(convexUser: any, authUser: any): any {
  if (!convexUser || !authUser) return null;
  
  return {
    // Keep both id formats for compatibility
    id: convexUser._id,
    _id: convexUser._id,
    name: authUser.name || "",
    email: authUser.email || "",
    profilePicture: convexUser.profilePicture,
    type: convexUser.type?.toLowerCase() || "developer",
    phoneNumber: convexUser.phoneNumber,
    countryCode: convexUser.countryCode,
    country: convexUser.country,
    industry: convexUser.industry,
    isVerified: convexUser.isVerified || false,
    kycStatus: convexUser.kycStatus,
    earlybird: convexUser.earlybird || false,
    wallet: convexUser.wallet || 0,
    updatedAt: new Date().toISOString(),
    createdAt: new Date(convexUser._creationTime).toISOString(),
    role: convexUser.roleId,
    // Include all original Convex fields for components that need them
    ...convexUser,
    // Override with auth data
    authUser,
  };
}

export function useUserConvex(): {
  user: any;
  authUser: any;
  session: any;
  loading: boolean;
  error: null;
  refetch: () => void;
} {
  const { data: session, isPending: sessionLoading } = useSession();
  
  // Use the getCurrentUser function from auth.ts which handles BetterAuth integration correctly
  const currentUser = useQuery(api.auth.getCurrentUser, {});

  // Get complete profile with role-specific data - ensure we have a valid users table ID  
  const completeProfile = useQuery(
    api.userProfiles.getCompleteUserProfile,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const loading = sessionLoading || Boolean(session?.user && !currentUser);
  
  const transformedUser = transformConvexUserToUser(
    completeProfile ? { ...currentUser, ...completeProfile, _id: currentUser?._id } : currentUser,
    session?.user
  );

  return {
    user: transformedUser,
    authUser: session?.user || null,
    session,
    loading,
    error: null,
    refetch: () => {
      // Convex automatically refetches when dependencies change
    },
  };
}

export function useAuthUser(): {
  user: any;
  session: any;
  loading: boolean;
  error: null;
} {
  const { data: session, isPending: loading } = useSession();
  
  return {
    user: session?.user || null,
    session,
    loading,
    error: null,
  };
}

// Backward compatibility
export function useUserData() {
  return useUserConvex();
}