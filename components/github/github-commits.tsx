"use client";

import { GitHubCommit } from "@/types/github";
import { formatDistanceToNow } from "date-fns";
import { Github, GitCommit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface GitHubCommitsProps {
  commits: GitHubCommit[];
  isLoading?: boolean;
}

/**
 * Format commit message for display
 */
function formatCommitMessage(message: string): string {
  // Truncate message if too long
  if (message.length > 80) {
    return message.substring(0, 77) + "...";
  }
  return message;
}

/**
 * Format commit time for display
 */
function formatCommitTime(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (error) {
    return "Unknown time";
  }
}

/**
 * Component to display GitHub commits
 */
export function GitHubCommitList({ commits, isLoading = false }: GitHubCommitsProps) {
  if (isLoading) {
    return (
      <Card className="bg-[#1e2736] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">Recent Commits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                <div className="flex items-center gap-2">
                  <div className="h-3 bg-gray-700 rounded w-1/4" />
                  <div className="h-3 bg-gray-700 rounded w-1/5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!commits || commits.length === 0) {
    return (
      <Card className="bg-[#1e2736] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">Recent Commits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <GitCommit className="h-12 w-12 mb-3 text-gray-500" />
            <p>No commits found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1e2736] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white text-lg">Recent Commits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {commits.map((commit) => (
            <div key={commit.sha} className="border-b border-gray-800 pb-3 last:border-0 last:pb-0">
              <Link 
                href={commit.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-200 hover:text-white transition-colors block mb-1"
              >
                {formatCommitMessage(commit.commit.message)}
              </Link>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <GitCommit className="h-3 w-3" />
                  <span>{commit.sha.substring(0, 7)}</span>
                </div>
                <span>{formatCommitTime(commit.commit.author.date)}</span>
                <Link 
                  href={`https://github.com/${commit.repository.full_name}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Github className="h-3 w-3" />
                  <span>{commit.repository.name}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 