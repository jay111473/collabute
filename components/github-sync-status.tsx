"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  GitBranch,
  Users,
  FileText,
  Activity
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Id } from "@/convex/_generated/dataModel";

interface SyncStatusProps {
  repositoryId: Id<"github_repositories">;
}

/**
 * Comprehensive sync status component for a repository
 */
export function GitHubSyncStatus({ repositoryId }: SyncStatusProps) {
  const syncState = useQuery(api.githubSyncState.getDetailedRepositorySync, { repositoryId });
  const triggerSync = useMutation(api.githubSync.triggerManualSync);

  if (!syncState) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading sync status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { repository, issues, collaborators, operations } = syncState;
  const isStale = Date.now() - repository.lastSyncedAt > 10 * 60 * 1000;
  const isError = repository.syncStatus === "error";
  const isPending = repository.syncStatus === "pending";

  const handleTriggerSync = async () => {
    try {
      await triggerSync({ repositoryId });
    } catch (error) {
      console.error("Failed to trigger sync:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
          <SyncStatusBadge 
            status={repository.syncStatus} 
            isStale={isStale}
            isPending={isPending}
          />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{repository.name}</p>
              <p className="text-xs text-muted-foreground">
                Last synced {formatDistanceToNow(repository.lastSyncedAt)} ago
              </p>
            </div>
            <Button
              onClick={handleTriggerSync}
              variant={isError ? "destructive" : "outline"}
              size="sm"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Sync Now
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Progress Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Repository Sync */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repository</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <SyncIcon status={repository.syncStatus} />
              <span className="text-xs capitalize">{repository.syncStatus}</span>
            </div>
          </CardContent>
        </Card>

        {/* Issues Sync */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{issues.stats.total}</div>
              <div className="text-xs text-muted-foreground">
                {issues.stats.synced} synced, {issues.stats.error} errors
              </div>
              <SyncProgress 
                synced={issues.stats.synced}
                total={issues.stats.total}
                error={issues.stats.error}
              />
            </div>
          </CardContent>
        </Card>

        {/* Collaborators Sync */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collaborators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collaborators.total}</div>
            <div className="text-xs text-muted-foreground">
              Team members synced
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues */}
      {issues.recent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {issues.recent.map((issue, index) => (
              <div key={issue._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <Badge variant={issue.state === "open" ? "default" : "secondary"}>
                    #{issue.number}
                  </Badge>
                  <span className="text-sm truncate">{issue.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SyncIcon status={issue.syncStatus} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(issue.lastSyncedAt)} ago
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Operations */}
      {operations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {operations.slice(0, 5).map((operation) => (
              <div key={operation._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <SyncIcon status={operation.status === "success" ? "synced" : "error"} size="sm" />
                  <span className="text-sm capitalize">
                    {operation.operation} {operation.entityType}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {operation.type}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(operation.startedAt)} ago
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Compact sync status component for repository lists
 */
export function CompactSyncStatus({ repositoryId }: SyncStatusProps) {
  const syncState = useQuery(api.githubSyncState.getRepositorySyncState, { repositoryId });
  const triggerSync = useMutation(api.githubSync.triggerManualSync);

  if (!syncState) {
    return (
      <div className="flex items-center space-x-2">
        <RefreshCw className="h-3 w-3 animate-spin" />
        <span className="text-xs">Loading...</span>
      </div>
    );
  }

  const handleSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await triggerSync({ repositoryId });
    } catch (error) {
      console.error("Failed to trigger sync:", error);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <SyncStatusBadge 
        status={syncState.syncStatus} 
        isStale={syncState.isStale}
        isPending={syncState.syncStatus === "pending"}
      />
      
      {syncState.needsAttention && (
        <Button
          onClick={handleSync}
          variant="ghost"
          size="sm"
          className="h-6 px-2"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
      
      <span className="text-xs text-muted-foreground">
        {formatDistanceToNow(syncState.lastSyncedAt)} ago
      </span>
    </div>
  );
}

/**
 * Global sync overview dashboard
 */
export function GitHubSyncOverview() {
  const overview = useQuery(api.githubSyncState.getUserSyncOverview);
  const schedulerStatus = useQuery(api.githubScheduler.getSchedulerStatus);

  if (!overview || !schedulerStatus) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 animate-pulse" />
            <span>Loading sync overview...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { stats, repositories, recentOperations } = overview;
  const syncPercentage = stats.totalRepositories > 0 
    ? Math.round((stats.syncedRepositories / stats.totalRepositories) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRepositories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Synced</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.syncedRepositories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.errorRepositories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingRepositories}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Sync Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall sync status</span>
              <span>{syncPercentage}%</span>
            </div>
            <Progress value={syncPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{stats.syncedRepositories} of {stats.totalRepositories} synced</span>
              <HealthBadge status={schedulerStatus.healthStatus} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repository List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Repositories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {repositories.map((repo) => (
            <div key={repo._id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{repo.name}</span>
                {repo.isStale && <Badge variant="outline">Stale</Badge>}
              </div>
              <CompactSyncStatus repositoryId={repo._id} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ====================================
// HELPER COMPONENTS
// ====================================

function SyncStatusBadge({ 
  status, 
  isStale, 
  isPending 
}: { 
  status: string; 
  isStale: boolean; 
  isPending: boolean; 
}) {
  if (isPending) {
    return <Badge variant="outline" className="text-yellow-600">Syncing</Badge>;
  }
  
  if (status === "error") {
    return <Badge variant="destructive">Error</Badge>;
  }
  
  if (isStale) {
    return <Badge variant="outline" className="text-orange-600">Stale</Badge>;
  }
  
  return <Badge variant="outline" className="text-green-600">Synced</Badge>;
}

function SyncIcon({ 
  status, 
  size = "default" 
}: { 
  status: string; 
  size?: "default" | "sm"; 
}) {
  const className = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  
  switch (status) {
    case "synced":
      return <CheckCircle className={`${className} text-green-600`} />;
    case "error":
      return <AlertCircle className={`${className} text-red-600`} />;
    case "pending":
      return <RefreshCw className={`${className} text-yellow-600 animate-spin`} />;
    default:
      return <Clock className={`${className} text-gray-400`} />;
  }
}

function SyncProgress({ 
  synced, 
  total, 
  error 
}: { 
  synced: number; 
  total: number; 
  error: number; 
}) {
  if (total === 0) {
    return <Progress value={0} className="h-1" />;
  }
  
  const syncedPercentage = (synced / total) * 100;
  const errorPercentage = (error / total) * 100;
  
  return (
    <div className="space-y-1">
      <Progress value={syncedPercentage} className="h-1" />
      {error > 0 && (
        <div className="text-xs text-red-600">
          {error} error{error !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

function HealthBadge({ status }: { status: string }) {
  switch (status) {
    case "healthy":
      return <Badge variant="outline" className="text-green-600">Healthy</Badge>;
    case "warning":
      return <Badge variant="outline" className="text-yellow-600">Warning</Badge>;
    case "critical":
      return <Badge variant="destructive">Critical</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}