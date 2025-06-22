"use client";

import { User } from "@/types/dashboard";
import { useState, useEffect, useCallback } from "react";

interface UseUserDataOptions {
  depth?: number;
  cacheTime?: number; // in milliseconds
}

interface UserDataState {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Simple in-memory cache
const userCache = new Map<string, { data: User; timestamp: number }>();
const pendingRequests = new Map<string, Promise<User>>();

export function useUserData(options: UseUserDataOptions = {}): UserDataState {
  const { depth = 1, cacheTime = 5 * 60 * 1000 } = options; // 5 minutes default
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `user-${depth}`;

  const fetchUser = useCallback(async (): Promise<User> => {
    // Check if there's already a pending request for this cache key
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey)!;
    }

    // Check cache first
    const cached = userCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }

    // Create and store the promise to prevent duplicate requests
    const fetchPromise = (async () => {
      try {
        const response = await fetch(`/api/user?depth=${depth}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userData = await response.json();
        
        // Cache the result
        userCache.set(cacheKey, {
          data: userData,
          timestamp: Date.now()
        });
        
        return userData;
      } finally {
        // Remove the pending request
        pendingRequests.delete(cacheKey);
      }
    })();

    pendingRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
  }, [depth, cacheTime, cacheKey]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Clear cache for this key to force fresh fetch
      userCache.delete(cacheKey);
      const userData = await fetchUser();
      setUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user data';
      setError(errorMessage);
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchUser, cacheKey]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await fetchUser();
        setUser(userData);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user data';
        setError(errorMessage);
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    refetch
  };
} 