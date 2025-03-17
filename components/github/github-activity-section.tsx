"use client";

import { useState, useEffect } from "react";
import { getGitHubData } from "@/lib/get-github-data";
import { GitHubData } from "@/types/github";
import { ContributionActivity } from "./contribution-activity";
import { GitHubHeatmap } from "./github-heatmap";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface GitHubActivitySectionProps {
  token: string;
  userId?: string;
}

/**
 * GitHub activity section with contribution activity and heatmap
 */
export function GitHubActivitySection({ token, userId }: GitHubActivitySectionProps) {
  const [githubData, setGithubData] = useState<GitHubData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getGitHubData(token, userId);
        setGithubData(data);
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
    };

    fetchGitHubData();
  }, [token, userId]);

  if (error) {
    return (
      <Card className="bg-[#1e2736] border-gray-800 p-6">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ContributionActivity 
        activities={githubData?.activities || []} 
        isLoading={isLoading} 
      />
      <GitHubHeatmap 
        stats={githubData?.stats} 
        isLoading={isLoading} 
      />
    </div>
  );
} 