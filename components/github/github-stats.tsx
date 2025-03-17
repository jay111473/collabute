"use client";

import { GitHubStats } from "@/types/github";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitCommit, GitCommitIcon, GitPullRequest, Github } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface GitHubStatsProps {
  stats: GitHubStats;
  isLoading?: boolean;
}

/**
 * Component to display GitHub contribution stats
 */
export function GitHubStatsCard({ stats, isLoading = false }: GitHubStatsProps) {
  if (isLoading) {
    return (
      <Card className="bg-[#1e2736] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">GitHub Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-8 bg-gray-700 rounded w-1/2 mx-auto mb-2" />
                <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto" />
              </div>
            ))}
          </div>
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <div className="h-4 bg-gray-700 rounded w-1/3" />
                  <div className="h-4 bg-gray-700 rounded w-1/6" />
                </div>
                <div className="h-2 bg-gray-700 rounded w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="bg-[#1e2736] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">GitHub Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <Github className="h-12 w-12 mb-3 text-gray-500" />
            <p>No GitHub stats available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get top repositories by contribution count
  const topRepos = Object.entries(stats.contributionsByRepo || {})
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5);

  // Calculate total contributions for percentage
  const totalContributions = Object.values(stats.contributionsByRepo || {}).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <Card className="bg-[#1e2736] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white text-lg">GitHub Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-xl font-semibold text-white mb-1">
              <GitCommit className="h-5 w-5 text-blue-400" />
              <span>{stats.totalCommits || 0}</span>
            </div>
            <p className="text-sm text-gray-400">Commits</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-xl font-semibold text-white mb-1">
              <GitPullRequest className="h-5 w-5 text-purple-400" />
              <span>{stats.totalPullRequests || 0}</span>
            </div>
            <p className="text-sm text-gray-400">Pull Requests</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-xl font-semibold text-white mb-1">
              <GitCommitIcon className="h-5 w-5 text-yellow-400" />
              <span>{stats.totalIssues || 0}</span>
            </div>
            <p className="text-sm text-gray-400">Issues</p>
          </div>
        </div>

        {topRepos.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Top Repositories</h3>
            <div className="space-y-3">
              {topRepos.map(([repoName, count]) => {
                const percentage = totalContributions > 0 
                  ? Math.round((count / totalContributions) * 100) 
                  : 0;
                
                return (
                  <div key={repoName}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-300">
                        {repoName.split('/')[1] || repoName}
                      </span>
                      <span className="text-xs text-gray-400">{count} contributions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={percentage} 
                        className="h-1.5 bg-gray-700" 
                      />
                      <span className="text-xs text-gray-400">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 