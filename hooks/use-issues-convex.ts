"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { IssueWithRequests } from "@/types/convex";

interface UseIssuesWithRequestsOptions {
  projectId?: Id<"projects">;
  status?: string;
  limit?: number;
  offset?: number;
}

export function useIssuesWithRequests(
  options: UseIssuesWithRequestsOptions = {}
): {
  issues: IssueWithRequests[];
  loading: boolean;
  error: null;
} {
  const { projectId, status, limit, offset } = options;

  const issues = useQuery(api.issues.getIssuesWithRequests, {
    projectId,
    status,
    limit,
    offset,
  });

  return {
    issues: issues || [],
    loading: issues === undefined,
    error: null,
  };
}

export function useIssueById(issueId: Id<"issues">) {
  const issue = useQuery(api.issues.getIssueById, { issueId });

  return {
    issue: issue || undefined,
    loading: issue === undefined,
    error: null,
  };
}

export function useIssueApplications(issueId: Id<"issues">, status?: string) {
  const applications = useQuery(api.issues.getIssueApplications, {
    issueId,
    status,
  });

  return {
    applications: applications || [],
    loading: applications === undefined,
    error: null,
  };
}
