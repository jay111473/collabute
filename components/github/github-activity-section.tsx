"use client";

import { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { GitHubClientSection } from "./github-client-section";
import { GitHubActivityData } from "@/types/github";

interface GitHubActivitySectionProps {
  token: string;
  userId?: string;
}

/**
 * GitHub activity section (client component) that fetches data using Convex
 */
export function GitHubActivitySection({
  token,
  userId,
}: GitHubActivitySectionProps) {
  const [githubData, setGithubData] = useState<GitHubActivityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGithubActivities = useAction(api.github.fetchGithubActivities);

  useEffect(() => {
    async function loadGithubData() {
      if (!userId) {
        setError("User ID is required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const activities = await fetchGithubActivities({
          userId: userId as Id<"users">,
        });

        // Transform activities to match expected format
        const transformedData = {
          activities: activities.slice(0, 10),
          totalCount: activities.length,
        };

        setGithubData(transformedData);
      } catch (err) {
        console.error("Error fetching GitHub data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch GitHub data. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadGithubData();
  }, [userId, fetchGithubActivities]);

  return (
    <GitHubClientSection
      githubData={githubData}
      isLoading={isLoading}
      error={error}
    />
  );
}
