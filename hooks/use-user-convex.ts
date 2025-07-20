"use client";

import { useQuery } from "convex/react";
import { useSession } from "@/lib/auth-client";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { User } from "@/types/dashboard";

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
  
  // Get the user profile from Convex if we have a session
  const userProfile = useQuery(
    api.users.getUserProfile,
    session?.user?.id ? { authUserId: session.user.id as any } : "skip"
  );

  // Get complete profile with role-specific data
  const completeProfile = useQuery(
    api.userProfiles.getCompleteUserProfile,
    userProfile ? { userId: userProfile._id } : "skip"
  );

  const loading = sessionLoading || Boolean(session?.user?.id && userProfile === undefined);
  
  const transformedUser = transformConvexUserToUser(
    completeProfile || userProfile,
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