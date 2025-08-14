import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Hook to fetch enhanced user profile data including ratings, achievements, and recent projects
 */
export const useEnhancedUserProfile = (userId: Id<"users"> | undefined) => {
  const userProfile = useQuery(
    api.userProfiles.getEnhancedUserProfile,
    userId ? { userId } : "skip"
  );

  const userRating = useQuery(
    api.userProfiles.getUserRating,
    userId ? { userId } : "skip"
  );

  const userAchievements = useQuery(
    api.userProfiles.getUserAchievements,
    userId ? { userId } : "skip"
  );

  const userProjects = useQuery(
    api.userProfiles.getUserProjects,
    userId ? { userId, limit: 4 } : "skip"
  );

  // Combine all data into enhanced user object
  const enhancedUser = userProfile ? {
    ...userProfile,
    rating: userRating,
    achievements: userAchievements?.map(grant => grant.achievement).filter(Boolean) || [],
    recentProjects: userProjects || []
  } : undefined;

  return {
    enhancedUser,
    isLoading: userProfile === undefined && userId !== undefined,
    error: null, // You can add error handling here if needed
  };
};

/**
 * Hook to fetch just the user rating data
 */
export const useUserRating = (userId: Id<"users"> | undefined) => {
  return useQuery(
    api.userProfiles.getUserRating,
    userId ? { userId } : "skip"
  );
};

/**
 * Hook to fetch user achievements
 */
export const useUserAchievements = (userId: Id<"users"> | undefined) => {
  return useQuery(
    api.userProfiles.getUserAchievements,
    userId ? { userId } : "skip"
  );
};

/**
 * Hook to fetch user projects
 */
export const useUserProjects = (userId: Id<"users"> | undefined, limit?: number) => {
  return useQuery(
    api.userProfiles.getUserProjects,
    userId ? { userId, limit } : "skip"
  );
};

/**
 * Hook to fetch user reviews
 */
export const useUserReviews = (userId: Id<"users"> | undefined, limit?: number) => {
  return useQuery(
    api.userProfiles.getUserReviews,
    userId ? { userId, limit } : "skip"
  );
};
