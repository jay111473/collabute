import { NextRequest, NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { createGitHubAPI } from "@/lib/github-api";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

export async function POST(request: NextRequest) {
  try {
    const token = await convexAuthNextjsToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create authenticated convex client
    const authenticatedConvex = new ConvexHttpClient(
      process.env.NEXT_PUBLIC_CONVEX_URL!
    );
    authenticatedConvex.setAuth(token);

    const githubAPI = await createGitHubAPI();
    if (!githubAPI) {
      return NextResponse.json(
        { error: "GitHub not connected" },
        { status: 400 }
      );
    }

    // Fetch repositories from GitHub
    const repositories = await githubAPI.getUserRepositories();

    // Transform and sync to Convex
    const repoData = repositories.map((repo) => ({
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

    const syncedRepos = await authenticatedConvex.mutation(
      api.github.syncUserRepositories,
      {
        repositories: repoData,
      }
    );

    return NextResponse.json({
      success: true,
      syncedCount: syncedRepos.length,
      repositories: syncedRepos,
    });
  } catch (error) {
    console.error("Error syncing repositories:", error);
    return NextResponse.json(
      { error: "Failed to sync repositories" },
      { status: 500 }
    );
  }
}
