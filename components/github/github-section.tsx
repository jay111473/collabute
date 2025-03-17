"use client";

import { useState, useEffect } from "react";
import { GitHubActivityList } from "./github-activity";
import { GitHubCommitList } from "./github-commits";
import { GitHubStatsCard } from "./github-stats";
import { getGitHubData } from "@/lib/get-github-data";
import { GitHubData } from "@/types/github";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface GitHubSectionProps {
  token: string;
  userId?: string;
}

/**
 * Main GitHub section component that displays activities, commits, and stats
 */
export function GitHubSection({ token, userId }: GitHubSectionProps) {
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
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">GitHub Contributions</h2>
      
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="bg-[#1e2736] border-gray-800">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="commits">Commits</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="mt-4">
          <GitHubActivityList 
            activities={githubData?.activities || []} 
            isLoading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="commits" className="mt-4">
          <GitHubCommitList 
            commits={githubData?.commits || []} 
            isLoading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="stats" className="mt-4">
          <GitHubStatsCard 
            stats={githubData?.stats || { 
              totalCommits: 0, 
              totalPullRequests: 0, 
              totalIssues: 0, 
              contributionsByRepo: {} 
            }} 
            isLoading={isLoading} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 