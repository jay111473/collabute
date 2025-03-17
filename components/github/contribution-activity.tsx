"use client";

import { GitHubActivity } from "@/types/github";
import { formatDistanceToNow } from "date-fns";
import { Github, GitBranch, GitPullRequest, GitCommit, GitMerge, Star, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContributionActivityProps {
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
    case "PushEvent":
      return `Pushed ${payload.size || 0} commit(s) to ${repo.name}`;
    case "PullRequestEvent":
      return `${payload.action} pull request in ${repo.name}`;
    case "CreateEvent":
      return `Created ${payload.ref_type || "repository"} in ${repo.name}`;
    case "ForkEvent":
      return `Forked ${repo.name}`;
    case "WatchEvent":
      return `Starred ${repo.name}`;
    case "IssuesEvent":
      return `${payload.action} issue in ${repo.name}`;
    case "IssueCommentEvent":
      return `Commented on issue in ${repo.name}`;
    case "DeleteEvent":
      return `Deleted ${payload.ref_type} in ${repo.name}`;
    case "ReleaseEvent":
      return `Released ${payload.release?.tag_name || "new version"} in ${repo.name}`;
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
 * Component to display contribution activity
 */
export function ContributionActivity({ activities, isLoading = false }: ContributionActivityProps) {
  // Sample activities for the UI mockup
  const sampleActivities = [
    {
      title: "Header component for the homepage",
      subtitle: "Ai Sport coach, plans, meals",
      time: "Yesterday"
    },
    {
      title: "Fixing interface issues",
      subtitle: "Saas crypto platform",
      time: "2 days ago"
    },
    {
      title: "Backend system design",
      subtitle: "Ai assistant tool",
      time: "3 days ago"
    },
    {
      title: "Api integration for payment",
      subtitle: "E-commerce online shop",
      time: "1 week ago"
    }
  ];

  if (isLoading) {
    return (
      <Card className="bg-[#1e2736] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">Contribution activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-start gap-3 animate-pulse">
                <div className="mt-1">
                  <div className="h-6 w-6 rounded-full bg-gray-700" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-700 rounded w-1/2" />
                </div>
                <div className="h-3 bg-gray-700 rounded w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1e2736] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white text-lg">Contribution activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sampleActivities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="mt-1">
                <div className="h-6 w-6 flex items-center justify-center rounded-full border border-gray-700">
                  <GitBranch className="h-3 w-3 text-gray-400" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-white text-sm font-medium">{activity.title}</div>
                <div className="text-gray-400 text-xs">{activity.subtitle}</div>
              </div>
              <div className="text-gray-400 text-xs whitespace-nowrap">{activity.time}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 