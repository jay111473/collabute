"use client";

import { GitHubActivityData } from "@/types/github";
import { ContributionActivity } from "./contribution-activity";
import { MergedPullRequests } from "./merged-pull-requests";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface GitHubClientSectionProps {
  githubData: GitHubActivityData | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * GitHub activity client-side component that receives pre-fetched data
 */
export function GitHubClientSection({ 
  githubData, 
  isLoading, 
  error 
}: GitHubClientSectionProps) {
  if (error) {
    return (
      <Card className="bg-black border-gray-800 p-6">
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
      <MergedPullRequests
        activities={githubData?.activities || []}
        isLoading={isLoading}
      />
    </div>
  );
} 