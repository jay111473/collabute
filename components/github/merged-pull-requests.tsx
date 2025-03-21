"use client";

import { GitHubActivity, PullRequestPayload } from "@/types/github";
import { formatDistanceToNow } from "date-fns";
import { GitPullRequest, Github } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface MergedPullRequestsProps {
  activities: GitHubActivity[];
  isLoading?: boolean;
}

/**
 * Get pull request title
 */
function getPullRequestTitle(activity: GitHubActivity): string {
  const prPayload = activity.payload as PullRequestPayload;
  return prPayload.pull_request.title || `Pull request #${prPayload.number}`;
}

/**
 * Format activity time for display
 */
function formatActivityTime(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (error) {
    return "Unknown time";
  }
}

/**
 * Get pull request URL
 */
function getPullRequestUrl(activity: GitHubActivity): string {
  const { repo } = activity;
  const prPayload = activity.payload as PullRequestPayload;
  return prPayload.pull_request.html_url || `https://github.com/${repo.name}/pull/${prPayload.number}`;
}

/**
 * Filter merged pull requests
 */
function filterMergedPullRequests(activities: GitHubActivity[]): GitHubActivity[] {
  return activities.filter(activity => {
    if (activity.type !== "PullRequestEvent") return false;
    
    const prPayload = activity.payload as PullRequestPayload;
    return prPayload.action === "closed" && prPayload.pull_request.merged;
  });
}

/**
 * Component to display merged pull requests
 */
export function MergedPullRequests({ activities, isLoading = false }: MergedPullRequestsProps) {
  const mergedPullRequests = filterMergedPullRequests(activities);

  if (isLoading) {
    return (
      <Card className="bg-[#1e2736] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">Merged Pull Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-start gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-gray-700" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!mergedPullRequests || mergedPullRequests.length === 0) {
    return (
      <Card className="bg-[#1e2736] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">Merged Pull Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <GitPullRequest className="h-12 w-12 mb-3 text-gray-500" />
            <p>No merged pull requests found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1e2736] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white text-lg">Merged Pull Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mergedPullRequests.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.actor.avatar_url} alt={activity.actor.login} />
                <AvatarFallback className="bg-gray-700 text-white">
                  {activity.actor.login[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className="bg-purple-900/30 text-purple-300 border-purple-800 px-2 py-0 h-5 text-xs flex items-center gap-1"
                  >
                    <GitPullRequest className="h-3 w-3" />
                    <span>Merged</span>
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {formatActivityTime(activity.created_at)}
                  </span>
                </div>
                <Link 
                  href={getPullRequestUrl(activity)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {getPullRequestTitle(activity)}
                </Link>
                <div className="text-xs text-gray-500">
                  in {activity.repo.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 