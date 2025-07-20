import { NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/auth-client";
import { createGitHubAPI } from "@/lib/github-api";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const session = await authClient.getSession();
    if (!session?.data?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repositoryId } = await request.json();
    if (!repositoryId) {
      return NextResponse.json({ error: "Repository ID required" }, { status: 400 });
    }

    const githubAPI = await createGitHubAPI();
    if (!githubAPI) {
      return NextResponse.json({ error: "GitHub not connected" }, { status: 400 });
    }

    // Get repository details from Convex
    const repository = await convex.query(api.github.getRepositoryStats, {
      repositoryId: repositoryId as Id<"github_repositories">,
    });

    if (!repository?.repository) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    // Parse owner and repo name from full name
    const [owner, repoName] = repository.repository.fullName.split("/");

    // Fetch issues from GitHub
    const githubIssues = await githubAPI.getRepositoryIssues(owner, repoName);

    // Transform and sync to Convex
    const issueData = githubIssues.map(issue => ({
      number: issue.number,
      title: issue.title,
      body: issue.body || undefined,
      state: issue.state,
      labels: issue.labels.map(label => label.name),
      assignee: issue.assignee?.login,
      milestone: issue.milestone?.title,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      closedAt: issue.closed_at || undefined,
      htmlUrl: issue.html_url,
    }));

    const syncedIssues = await convex.mutation(api.github.syncRepositoryIssues, {
      repositoryId: repositoryId as Id<"github_repositories">,
      issues: issueData,
    });

    return NextResponse.json({ 
      success: true, 
      syncedCount: syncedIssues.length,
      issues: syncedIssues 
    });
  } catch (error) {
    console.error("Error syncing issues:", error);
    return NextResponse.json(
      { error: "Failed to sync issues" }, 
      { status: 500 }
    );
  }
}