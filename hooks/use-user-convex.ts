"use client";

import { useQuery, useMutation } from "convex/react";
import { useSession } from "@/lib/auth-client";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

function transformConvexUserToUser(convexUser: any): any {
  if (!convexUser) return null;

  return {
    // Keep both id formats for compatibility
    id: convexUser._id,
    _id: convexUser._id,
    name: convexUser.name || "",
    email: convexUser.email || "",
    profilePicture: convexUser.profilePicture || convexUser.image,
    type: convexUser.type?.toLowerCase() || "developer",
    phoneNumber: convexUser.phoneNumber,
    countryCode: convexUser.countryCode,
    country: convexUser.country,
    industry: convexUser.industry,
    isVerified: convexUser.isVerified || false,
    kycStatus: convexUser.kycStatus,
    earlybird: convexUser.earlybird || false,
    wallet: convexUser.wallet || 0,
    updatedAt: new Date(
      convexUser.updatedAt || convexUser._creationTime
    ).toISOString(),
    createdAt: new Date(
      convexUser.createdAt || convexUser._creationTime
    ).toISOString(),
    role: convexUser.roleId,
    // Include all original Convex fields for components that need them
    ...convexUser,
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

  const createMissingUser = useMutation(api.auth.createMissingUser);
  const createGithubProfile = useMutation(api.auth.createGithubProfileForUser);

  // Use the getCurrentUser function from auth.ts which handles BetterAuth integration correctly
  const currentUser = useQuery(api.auth.getCurrentUser, {});
  
  // Debug: Add query to check user accounts (after currentUser is declared)
  const debugAccounts = useQuery(
    api.auth.debugUserAccounts,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  // Debug: List all users in the database
  const allUsers = useQuery(api.auth.listAllUsers, {});
  
  // Debug: List all accounts and sessions
  const allAccounts = useQuery(api.auth.listAllAccounts, {});
  const allSessions = useQuery(api.auth.listAllSessions, {});

  // Auto-create user if session exists but no user in Convex
  useEffect(() => {
    if (
      session?.user &&
      !sessionLoading &&
      currentUser === null &&
      allUsers?.length === 0
    ) {
      console.log("Creating missing user from session data");
      createMissingUser({
        email: session.user.email,
        name: session.user.name || "",
        image: session.user.image || undefined,
        emailVerified: session.user.emailVerified || false,
        createdAt:
          typeof session.user.createdAt === "number"
            ? session.user.createdAt
            : Date.now(),
        updatedAt:
          typeof session.user.updatedAt === "number"
            ? session.user.updatedAt
            : Date.now(),
      }).catch(console.error);
    }
  }, [session, currentUser, allUsers, sessionLoading, createMissingUser]);

  // Debug: Log all database information
  useEffect(() => {
    if (debugAccounts) {
      console.log("🔍 Debug accounts data:", debugAccounts);
    }
    if (allAccounts) {
      console.log("🔍 All accounts in DB:", allAccounts);
    }
    if (allSessions) {
      console.log("🔍 All sessions in DB:", allSessions);
    }
  }, [debugAccounts, allAccounts, allSessions]);

  // Create GitHub profile if user exists but no GitHub profile
  useEffect(() => {
    if (currentUser?._id && !sessionLoading && debugAccounts) {
      console.log("Attempting to create GitHub profile for user:", currentUser._id);
      console.log("Available accounts:", debugAccounts.accounts);
      
      // Only try to create if we have accounts
      if (debugAccounts.accounts && debugAccounts.accounts.length > 0) {
        createGithubProfile({ userId: currentUser._id }).catch((error) => {
          console.log("GitHub profile creation error:", error.message);
          // Don't throw error, just log it for now
        });
      } else {
        console.log("No accounts found for user, skipping GitHub profile creation");
      }
    }
  }, [currentUser, sessionLoading, createGithubProfile, debugAccounts]);
  // Get complete profile with role-specific data - ensure we have a valid users table ID
  const completeProfile = useQuery(
    api.userProfiles.getCompleteUserProfile,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );
  const loading = sessionLoading || Boolean(session?.user && !currentUser);

  const transformedUser = transformConvexUserToUser(
    completeProfile || currentUser
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
