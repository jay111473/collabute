"use client";

import { GitHubActivity, PushEventPayload, PullRequestPayload, CreateEventPayload, DeleteEventPayload, IssuesEventPayload, ReleaseEventPayload } from "@/types/github";
import { formatDistanceToNow } from "date-fns";
import { Github, GitBranch, GitPullRequest, GitCommit, GitMerge, Star, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface GitHubActivityProps {
  activities: GitHubActivity[];
  isLoading?: boolean;
}

/**
 * Maps GitHub activity types to icons
 */
const activityTypeIcons: Record<string, React.ReactNode> = {
  PushEvent: <GitCommit className="h-4 w-4" />,
  PullRequestEvent: <GitPullRequest className="h-4 w-4" />,
  CreateEvent: <GitBranch className="h-4 w-4" />,
  ForkEvent: <GitBranch className="h-4 w-4" />,
  WatchEvent: <Star className="h-4 w-4" />,
  IssuesEvent: <Eye className="h-4 w-4" />,
  IssueCommentEvent: <Eye className="h-4 w-4" />,
  DeleteEvent: <GitBranch className="h-4 w-4" />,
  ReleaseEvent: <GitMerge className="h-4 w-4" />,
};

/**
 * Format activity type for display
 */
function formatActivityType(type: string): string {
  return type
    .replace("Event", "")
    .replace(/([A-Z])/g, " $1")
    .trim();
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
 * Get activity description based on type and payload
 */
function getActivityDescription(activity: GitHubActivity): string {
  const { type, payload, repo } = activity;
  
  switch (type) {
    case "PushEvent": {
      const pushPayload = payload as PushEventPayload;
      return `Pushed ${pushPayload.size || 0} commit(s) to ${repo.name}`;
    }
    case "PullRequestEvent": {
      const prPayload = payload as PullRequestPayload;
      return `${prPayload.action} pull request in ${repo.name}`;
    }
    case "CreateEvent": {
      const createPayload = payload as CreateEventPayload;
      return `Created ${createPayload.ref_type || "repository"} in ${repo.name}`;
    }
    case "ForkEvent":
      return `Forked ${repo.name}`;
    case "WatchEvent":
      return `Starred ${repo.name}`;
    case "IssuesEvent": {
      const issuesPayload = payload as IssuesEventPayload;
      return `${issuesPayload.action} issue in ${repo.name}`;
    }
    case "IssueCommentEvent":
      return `Commented on issue in ${repo.name}`;
    case "DeleteEvent": {
      const deletePayload = payload as DeleteEventPayload;
      return `Deleted ${deletePayload.ref_type} in ${repo.name}`;
    }
    case "ReleaseEvent": {
      const releasePayload = payload as ReleaseEventPayload;
      return `Released ${releasePayload.release?.tag_name || "new version"} in ${repo.name}`;
    }
    default:
      return `Activity in ${repo.name}`;
  }
}

/**
 * Get repository URL from activity
 */
function getRepoUrl(repoName: string): string {
  return `https://github.com/${repoName}`;
}

/**
 * Component to display GitHub activities
 */
export function GitHubActivityList({ activities, isLoading = false }: GitHubActivityProps) {
  if (isLoading) {
    return (
      <Card className="bg-black border-grayBorders">
        <CardHeader>
          <CardTitle className="text-white text-lg">GitHub Activity</CardTitle>
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

  if (!activities || activities.length === 0) {
    return (
      <Card className="bg-[#1e2736] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">GitHub Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <Github className="h-12 w-12 mb-3 text-gray-500" />
            <p>No GitHub activity found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1e2736] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white text-lg">GitHub Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
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
                    className="bg-gray-800 text-gray-300 border-none px-2 py-0 h-5 text-xs flex items-center gap-1"
                  >
                    {activityTypeIcons[activity.type] || <Github className="h-3 w-3" />}
                    <span>{formatActivityType(activity.type)}</span>
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {formatActivityTime(activity.created_at)}
                  </span>
                </div>
                <Link 
                  href={getRepoUrl(activity.repo.name)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {getActivityDescription(activity)}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 