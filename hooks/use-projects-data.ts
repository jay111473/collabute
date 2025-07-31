"use client";

import { useState, useEffect, useCallback } from "react";
import { stringify } from "qs-esm";
import { Project } from "@/types/convex";

interface UseProjectsDataOptions {
  page?: number;
  limit?: number;
  type?: "startup" | "developer";
  status?: "active" | "completed" | "pending";
  cacheTime?: number; // in milliseconds
  where?: Record<string, any>; // PayloadCMS-style where query
}

interface ProjectsResponse {
  projects: Project[];
  totalPages: number;
  currentPage: number;
  totalProjects: number;
}

interface ProjectsDataState {
  projects: Project[];
  totalPages: number;
  currentPage: number;
  totalProjects: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Simple in-memory cache
const projectsCache = new Map<
  string,
  { data: ProjectsResponse; timestamp: number }
>();
const pendingRequests = new Map<string, Promise<ProjectsResponse>>();

export function useProjectsData(
  options: UseProjectsDataOptions = {}
): ProjectsDataState {
  const {
    page = 1,
    limit = 10,
    type,
    status,
    cacheTime = 3 * 60 * 1000, // 3 minutes default
    where = {},
  } = options;

  const [projects, setProjects] = useState<Project[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create cache key based on all parameters including where query
  const whereKey = JSON.stringify(where);
  const cacheKey = `projects-${page}-${limit}-${type || "all"}-${
    status || "all"
  }-${whereKey}`;

  const fetchProjects = useCallback(async (): Promise<ProjectsResponse> => {
    // Check if there's already a pending request for this cache key
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey)!;
    }

    // Check cache first
    const cached = projectsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }

    // Create and store the promise to prevent duplicate requests
    const fetchPromise = (async () => {
      try {
        // Build query object for PayloadCMS-style querying
        const queryObject: Record<string, any> = {
          page: page.toString(),
          limit: limit.toString(),
        };

        if (type) queryObject.type = type;
        if (status) queryObject.status = status;

        // Add PayloadCMS-style where query
        if (Object.keys(where).length > 0) {
          queryObject.where = where;
        }

        // Use qs-esm to stringify the query object
        const queryString = stringify(queryObject, { addQueryPrefix: true });

        console.log('Hook - queryString:', queryString);
        console.log('Hook - where:', where);
        
        const response = await fetch(`/api/projects${queryString}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const projectsData = await response.json();
        
        console.log('Hook - received projectsData:', {
          projectsLength: projectsData.projects?.length,
          totalProjects: projectsData.totalProjects,
          projects: projectsData.projects
        });

        // Cache the result
        projectsCache.set(cacheKey, {
          data: projectsData,
          timestamp: Date.now(),
        });

        return projectsData;
      } finally {
        // Remove the pending request
        pendingRequests.delete(cacheKey);
      }
    })();

    pendingRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
  }, [page, limit, type, status, cacheTime, cacheKey, where]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Clear cache for this key to force fresh fetch
      projectsCache.delete(cacheKey);
      const projectsData = await fetchProjects();
      setProjects(projectsData.projects);
      setTotalPages(projectsData.totalPages);
      setCurrentPage(projectsData.currentPage);
      setTotalProjects(projectsData.totalProjects);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch projects data";
      setError(errorMessage);
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchProjects, cacheKey]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await fetchProjects();
        setProjects(projectsData.projects);
        setTotalPages(projectsData.totalPages);
        setCurrentPage(projectsData.currentPage);
        setTotalProjects(projectsData.totalProjects);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch projects data";
        setError(errorMessage);
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [fetchProjects]);

  return {
    projects,
    totalPages,
    currentPage,
    totalProjects,
    loading,
    error,
    refetch,
  };
}
