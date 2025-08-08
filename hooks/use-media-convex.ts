"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Media } from "@/types/convex";

// Hook for getting a single media URL safely
export function useMediaUrl(
  mediaId?: Id<"media"> | null,
  fallbackUrl?: string
) {
  const url = useQuery(
    api.media.getSafeMediaUrl,
    mediaId ? { mediaId, fallbackUrl } : "skip"
  );

  return {
    url: url || fallbackUrl || null,
    loading: mediaId ? url === undefined : false,
    error: null, // Convex handles errors gracefully
  };
}

// Hook for getting multiple media objects by IDs
export function useMultipleMedia(mediaIds: Id<"media">[]) {
  const mediaMap = useQuery(
    api.media.getMultipleMedia,
    mediaIds.length > 0 ? { mediaIds } : "skip"
  );

  return {
    mediaMap: mediaMap || {},
    loading: mediaIds.length > 0 ? mediaMap === undefined : false,
    error: null,
    getMedia: (id: Id<"media">) => mediaMap?.[id] || null,
    getMediaUrl: (id: Id<"media">) => mediaMap?.[id]?.url || null,
  };
}

// Hook for getting media by IDs as array
export function useMediaByIds(ids: Id<"media">[]) {
  const media = useQuery(
    api.media.getMediaByIds,
    ids.length > 0 ? { ids } : "skip"
  );

  return {
    media: media || [],
    loading: ids.length > 0 ? media === undefined : false,
    error: null,
  };
}

// Hook for getting a single media object
export function useMedia(mediaId?: Id<"media"> | null) {
  const media = useQuery(
    api.media.getMediaById,
    mediaId ? { id: mediaId } : "skip"
  );

  return {
    media,
    url: media?.url || null,
    loading: mediaId ? media === undefined : false,
    error: null,
  };
}

// Hook for getting users with their profile pictures populated
export function useUsersWithMedia(userIds: Id<"users">[]) {
  const users = useQuery(
    api.media.getUsersWithMedia,
    userIds.length > 0 ? { userIds } : "skip"
  );

  return {
    users: users || [],
    loading: userIds.length > 0 ? users === undefined : false,
    error: null,
  };
}

// Utility hook for profile pictures specifically
export function useProfilePicture(
  user?: { profilePicture?: Id<"media"> | null } | null,
  fallbackUrl?: string
) {
  const { url, loading } = useMediaUrl(user?.profilePicture, fallbackUrl);

  return {
    profilePictureUrl: url,
    loading,
    hasProfilePicture: !!user?.profilePicture,
  };
}

// Hook for validating media access
export function useMediaWithValidation(
  mediaId: Id<"media">,
  requestingUserId?: Id<"users">
) {
  const media = useQuery(api.media.getMediaWithValidation, {
    mediaId,
    requestingUserId,
  });

  return {
    media,
    loading: media === undefined,
    error: null,
  };
}

// Batch profile picture hook for multiple users
export function useProfilePictures(
  users: Array<{ _id: Id<"users">; profilePicture?: Id<"media"> | null }>
) {
  const userIds = users.map((u) => u._id);
  const { users: usersWithMedia, loading } = useUsersWithMedia(userIds);

  // Create a map for easy lookup
  const profilePictureMap = usersWithMedia.reduce(
    (acc, user) => {
      if (user) {
        acc[user._id] = user.profilePictureMedia?.url || null;
      }
      return acc;
    },
    {} as Record<string, string | null>
  );

  return {
    profilePictureMap,
    loading,
    getProfilePictureUrl: (userId: Id<"users">) =>
      profilePictureMap[userId] || null,
  };
}

// Utility functions for safe media access (can be used outside of components)
export const getMediaUrlSafe = (media?: Media | null): string | null => {
  return media?.url || null;
};

export const getProfilePictureUrlSafe = (
  user?: { profilePicture?: Media | null } | null
): string | null => {
  return user?.profilePicture?.url || null;
};

// Hook for media by user (useful for galleries, file managers, etc.)
export function useMediaByUser(userId: Id<"users">, limit?: number) {
  const media = useQuery(api.media.getMediaByUser, {
    userId,
    limit,
  });

  return {
    media: media || [],
    loading: media === undefined,
    error: null,
  };
}

// Hook for media by type (useful for filtering)
export function useMediaByType(
  type: string,
  userId?: Id<"users">,
  limit?: number
) {
  const media = useQuery(api.media.getMediaByType, {
    type,
    userId,
    limit,
  });

  return {
    media: media || [],
    loading: media === undefined,
    error: null,
  };
}
