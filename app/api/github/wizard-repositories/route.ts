import { NextRequest } from "next/server";

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  private: boolean;
  description: string | null;
  language: string | null;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  created_at: string;
  size: number;
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  archived: boolean;
  disabled: boolean;
  fork: boolean;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
  } | null;
  topics: string[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const userId = searchParams.get("userId");
    
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    
    // Build GitHub API URL
    let githubUrl = `https://api.github.com/user/repos?per_page=${limit}&page=${page}&sort=updated&direction=desc`;
    
    // Add search if provided
    if (search) {
      githubUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(search)}+user:@me&per_page=${limit}&page=${page}&sort=updated&order=desc`;
    }

    const response = await fetch(githubUrl, {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Collabute-Alexandria"
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        return Response.json(
          { error: "GitHub authentication failed. Please reconnect your account." },
          { status: 401 }
        );
      }
      if (response.status === 403) {
        return Response.json(
          { error: "GitHub API rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle search results vs direct repos
    const repositories = search ? data.items : data;
    const totalCount = search ? data.total_count : undefined;
    
    // Transform repositories to match our interface
    const transformedRepos = repositories.map((repo: GitHubRepository) => ({
      repoId: repo.id.toString(),
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      isPrivate: repo.private,
      description: repo.description,
      language: repo.language,
      defaultBranch: repo.default_branch,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
      created_at: repo.created_at,
      size: repo.size,
      has_issues: repo.has_issues,
      has_projects: repo.has_projects,
      has_wiki: repo.has_wiki,
      archived: repo.archived,
      disabled: repo.disabled,
      fork: repo.fork,
      open_issues_count: repo.open_issues_count,
      license: repo.license,
      topics: repo.topics
    }));

    // Calculate pagination info
    const hasNextPage = search 
      ? (page * limit < totalCount!)
      : transformedRepos.length === limit;

    return Response.json({
      repositories: transformedRepos,
      pagination: {
        page,
        limit,
        totalCount: totalCount || transformedRepos.length,
        hasNextPage
      }
    });

  } catch (error) {
    console.error("Error fetching GitHub repositories:", error);
    return Response.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}