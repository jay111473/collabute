"use client";

import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { GitHubActivityList } from "./github-activity";
import { GitHubCommitList } from "./github-commits";
import { GitHubStatsCard } from "./github-stats";
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

  const fetchGithubActivities = useAction(api.github.fetchGithubActivities);
  const fetchGithubUserProfile = useAction(api.github.fetchGithubUserProfile);

  useEffect(() => {
    const fetchGitHubData = async () => {
      if (!userId) {
        setError("User ID is required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch activities and profile in parallel
        const [activities, profile] = await Promise.all([
          fetchGithubActivities({ userId: userId as Id<"users"> }),
          fetchGithubUserProfile({ userId: userId as Id<"users"> }).catch(() => null),
        ]);

        // Extract commits from push events
        const pushEvents = activities.filter((activity: any) => activity.type === "PushEvent");
        const commits = pushEvents.map((event: any) => ({
          sha: event.payload?.head || event.id,
          commit: {
            author: {
              name: event.actor?.login || "Unknown",
              email: "",
              date: event.created_at,
            },
            message: event.payload?.commits?.[0]?.message || "No commit message",
          },
          html_url: event.repo?.url || "",
          repository: {
            name: event.repo?.name || "",
            full_name: event.repo?.name || "",
            html_url: event.repo?.url || "",
          },
        }));

        // Calculate basic stats
        const stats = {
          totalCommits: pushEvents.length,
          totalPullRequests: activities.filter((a: any) => a.type === "PullRequestEvent").length,
          totalIssues: activities.filter((a: any) => a.type === "IssuesEvent").length,
          contributionsByRepo: activities.reduce((acc: Record<string, number>, activity: any) => {
            const repoName = activity.repo?.name || "Unknown";
            acc[repoName] = (acc[repoName] || 0) + 1;
            return acc;
          }, {}),
        };

        const data: GitHubData = {
          activities,
          commits,
          stats,
        };

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
  }, [userId, fetchGithubActivities, fetchGithubUserProfile]);

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