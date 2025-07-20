import { NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/auth-client";
import { createGitHubAPI } from "@/lib/github-api";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const session = await authClient.getSession();
    if (!session?.data?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const githubAPI = await createGitHubAPI();
    if (!githubAPI) {
      return NextResponse.json({ error: "GitHub not connected" }, { status: 400 });
    }

    // Fetch repositories from GitHub
    const repositories = await githubAPI.getUserRepositories();

    // Transform and sync to Convex
    const repoData = repositories.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || undefined,
      private: repo.private,
      htmlUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      language: repo.language || undefined,
      stargazersCount: repo.stargazers_count,
      forksCount: repo.forks_count,
      defaultBranch: repo.default_branch,
    }));

    const syncedRepos = await convex.mutation(api.github.syncUserRepositories, {
      userId: session.data.user.id as any,
      repositories: repoData,
    });

    return NextResponse.json({ 
      success: true, 
      syncedCount: syncedRepos.length,
      repositories: syncedRepos 
    });
  } catch (error) {
    console.error("Error syncing repositories:", error);
    return NextResponse.json(
      { error: "Failed to sync repositories" }, 
      { status: 500 }
    );
  }
}