"use client";

import { 
  GitHubActivity, 
  GitHubEventType,
  PushEventPayload,
  PullRequestPayload,
  CreateEventPayload,
  DeleteEventPayload,
  ReleaseEventPayload,
  IssuesEventPayload
} from "@/types/github";
import { formatDistanceToNow } from "date-fns";
import { Github, GitBranch, GitPullRequest, GitCommit, GitMerge, Star, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Types
interface ContributionActivityProps {
  activities: GitHubActivity[];
  isLoading?: boolean;
  title?: string;
  className?: string;
}

interface ActivityItemProps {
  activity: GitHubActivity;
}

// Utils
const formatActivityTime = (dateString: string): string => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return "Unknown time";
  }
};

const getRepoUrl = (repoName: string): string => `https://github.com/${repoName}`;

// Activity type icon mapping
const activityTypeIcons: Record<GitHubEventType, React.ReactNode> = {
  PushEvent: <GitCommit className="h-4 w-4 text-gray-400" />,
  PullRequestEvent: <GitPullRequest className="h-4 w-4 text-gray-400" />,
  CreateEvent: <GitBranch className="h-4 w-4 text-gray-400" />,
  ForkEvent: <GitBranch className="h-4 w-4 text-gray-400" />,
  WatchEvent: <Star className="h-4 w-4 text-gray-400" />,
  IssuesEvent: <Eye className="h-4 w-4 text-gray-400" />,
  IssueCommentEvent: <Eye className="h-4 w-4 text-gray-400" />,
  DeleteEvent: <GitBranch className="h-4 w-4 text-gray-400" />,
  ReleaseEvent: <GitMerge className="h-4 w-4 text-gray-400" />,
  CommitCommentEvent: <GitCommit className="h-4 w-4 text-gray-400" />,
  PublicEvent: <Github className="h-4 w-4 text-gray-400" />,
  MemberEvent: <Github className="h-4 w-4 text-gray-400" />,
  PullRequestReviewEvent: <GitPullRequest className="h-4 w-4 text-gray-400" />,
  PullRequestReviewCommentEvent: <GitPullRequest className="h-4 w-4 text-gray-400" />,
  GollumEvent: <Github className="h-4 w-4 text-gray-400" />
};

// Activity data transformers
const extractActivityTitle = (activity: GitHubActivity): string => {
  const { type, payload, repo } = activity;
  
  switch (type) {
    case "PushEvent": {
      const pushPayload = payload as PushEventPayload;
      if (pushPayload.commits?.length > 0) {
        return pushPayload.commits[0].message.split('\n')[0];
      }
      return `Push to ${repo.name}`;
    }
    case "PullRequestEvent": {
      const prPayload = payload as PullRequestPayload;
      return prPayload.pull_request.title || `Pull request #${prPayload.number}`;
    }
    case "CreateEvent": {
      const createPayload = payload as CreateEventPayload;
      const refType = createPayload.ref_type;
      return createPayload.ref ? `Created ${createPayload.ref}` : `Created ${refType}`;
    }
    case "ForkEvent":
      return `Forked from ${repo.name}`;
    case "WatchEvent":
      return `Starred ${repo.name}`;
    case "IssuesEvent": {
      const issuesPayload = payload as IssuesEventPayload;
      return issuesPayload.issue.title || `Issue #${issuesPayload.issue.number}`;
    }
    case "IssueCommentEvent":
      return `Comment on issue in ${repo.name}`;
    case "DeleteEvent": {
      const deletePayload = payload as DeleteEventPayload;
      return `Deleted ${deletePayload.ref}`;
    }
    case "ReleaseEvent": {
      const releasePayload = payload as ReleaseEventPayload;
      return releasePayload.release.name || releasePayload.release.tag_name;
    }
    case "CommitCommentEvent":
      return `Comment on commit in ${repo.name}`;
    case "PublicEvent":
      return `Made ${repo.name} public`;
    case "MemberEvent":
      return `Updated collaborators in ${repo.name}`;
    case "PullRequestReviewEvent":
      return `Review on pull request in ${repo.name}`;
    case "PullRequestReviewCommentEvent":
      return `Comment on pull request review in ${repo.name}`;
    case "GollumEvent":
      return `Updated wiki in ${repo.name}`;
    default:
      return repo.name;
  }
};

const extractActivityDescription = (activity: GitHubActivity): string => {
  const { type, payload, repo } = activity;
  
  switch (type) {
    case "PushEvent": {
      const pushPayload = payload as PushEventPayload;
      const branch = pushPayload.ref.replace('refs/heads/', '');
      return `Pushed ${pushPayload.size || 0} commit(s) to ${branch} in ${repo.name}`;
    }
    case "PullRequestEvent": {
      const prPayload = payload as PullRequestPayload;
      const action = prPayload.action === 'closed' && prPayload.pull_request.merged 
        ? 'merged' 
        : prPayload.action;
      return `${action} pull request #${prPayload.number} in ${repo.name}`;
    }
    case "CreateEvent": {
      const createPayload = payload as CreateEventPayload;
      const refType = createPayload.ref_type;
      const ref = createPayload.ref ? `${refType} ${createPayload.ref}` : refType;
      return `Created ${ref} in ${repo.name}`;
    }
    case "ForkEvent":
      return `Forked ${repo.name}`;
    case "WatchEvent":
      return `Starred ${repo.name}`;
    case "IssuesEvent": {
      const issuesPayload = payload as IssuesEventPayload;
      return `${issuesPayload.action} issue #${issuesPayload.issue.number} in ${repo.name}`;
    }
    case "IssueCommentEvent":
      return `Commented on issue in ${repo.name}`;
    case "DeleteEvent": {
      const deletePayload = payload as DeleteEventPayload;
      return `Deleted ${deletePayload.ref_type} ${deletePayload.ref} in ${repo.name}`;
    }
    case "ReleaseEvent": {
      const releasePayload = payload as ReleaseEventPayload;
      return `${releasePayload.action} release ${releasePayload.release.tag_name} in ${repo.name}`;
    }
    default:
      return `Activity in ${repo.name}`;
  }
};

const getActivityUrl = (activity: GitHubActivity): string => {
  const { type, payload, repo } = activity;
  const repoUrl = getRepoUrl(repo.name);
  
  switch (type) {
    case "PushEvent": {
      const pushPayload = payload as PushEventPayload;
      if (pushPayload.commits?.length > 0) {
        return pushPayload.commits[0].url || `${repoUrl}/commit/${pushPayload.head}`;
      }
      return `${repoUrl}/commits`;
    }
    case "PullRequestEvent": {
      const prPayload = payload as PullRequestPayload;
      return prPayload.pull_request.html_url || `${repoUrl}/pull/${prPayload.number}`;
    }
    case "IssuesEvent": {
      const issuesPayload = payload as IssuesEventPayload;
      return issuesPayload.issue.html_url || `${repoUrl}/issues/${issuesPayload.issue.number}`;
    }
    case "ReleaseEvent": {
      const releasePayload = payload as ReleaseEventPayload;
      return releasePayload.release.html_url || `${repoUrl}/releases`;
    }
    default:
      return repoUrl;
  }
};

// Components
const ActivityIcon = ({ type }: { type: GitHubEventType }) => (
  <div className="mt-1">
    <div className="h-6 w-6 flex items-center justify-center rounded-full border border-gray-700">
      {activityTypeIcons[type] || <Github className="h-3 w-3 text-gray-400" />}
    </div>
  </div>
);

const ActivityItem = ({ activity }: ActivityItemProps) => (
  <div className="flex items-start gap-3">
    <ActivityIcon type={activity.type} />
    <div className="flex-1">
      <a 
        href={getActivityUrl(activity)} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-white text-sm font-medium hover:underline"
      >
        {extractActivityTitle(activity)}
      </a>
      <div className="text-gray-400 text-xs">
        {extractActivityDescription(activity)}
      </div>
    </div>
    <div className="text-gray-400 text-xs whitespace-nowrap">
      {formatActivityTime(activity.created_at)}
    </div>
  </div>
);

const ActivitySkeleton = () => (
  <div className="flex items-start gap-3 animate-pulse">
    <div className="mt-1">
      <div className="h-6 w-6 rounded-full bg-gray-700" />
    </div>
    <div className="space-y-2 flex-1">
      <div className="h-4 bg-gray-700 rounded w-3/4" />
      <div className="h-3 bg-gray-700 rounded w-1/2" />
    </div>
    <div className="h-3 bg-gray-700 rounded w-20" />
  </div>
);

// Main component
export function ContributionActivity({ 
  activities, 
  isLoading = false,
  title = "Contribution activity",
  className = ""
}: ContributionActivityProps) {
  if (isLoading) {
    return (
      <Card className={`bg-black border-grayBorders ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-xl font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <ActivitySkeleton key={index} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-black border-grayBorders ${className}`}>
      <CardHeader className="pb-8">
        <CardTitle className="text-white text-xl font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.length === 0 ? (
            <div className="text-gray-400 text-sm">No recent activity found</div>
          ) : (
            activities.map((activity, index) => (
              <ActivityItem 
                key={activity.id || index} 
                activity={activity} 
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 