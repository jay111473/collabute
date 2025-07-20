import { authClient } from "./auth-client";

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  default_branch: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  labels: Array<{ name: string }>;
  assignee: { login: string } | null;
  milestone: { title: string } | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
}

export class GitHubAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`https://api.github.com${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async getUserRepositories(): Promise<GitHubRepository[]> {
    return this.request<GitHubRepository[]>(
      "/user/repos?per_page=100&sort=updated"
    );
  }

  async getRepositoryIssues(
    owner: string,
    repo: string
  ): Promise<GitHubIssue[]> {
    return this.request<GitHubIssue[]>(
      `/repos/${owner}/${repo}/issues?state=all&per_page=100`
    );
  }

  async createIssue(
    owner: string,
    repo: string,
    issue: {
      title: string;
      body?: string;
      labels?: string[];
      assignees?: string[];
    }
  ): Promise<GitHubIssue> {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(issue),
      }
    );

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async updateIssue(
    owner: string,
    repo: string,
    issueNumber: number,
    updates: {
      title?: string;
      body?: string;
      state?: "open" | "closed";
      labels?: string[];
    }
  ): Promise<GitHubIssue> {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }
}

export async function getGitHubAccessToken(): Promise<string | null> {
  try {
    const session = await authClient.getSession();
    if (!session?.data?.user) {
      return null;
    }

    // Get GitHub account from BetterAuth
    const response = await fetch("/api/auth/accounts", {
      headers: {
        Authorization: `Bearer ${session.data.session.token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const accounts = await response.json();
    const githubAccount = accounts.find(
      (account: any) => account.provider === "github"
    );

    return githubAccount?.access_token || null;
  } catch (error) {
    console.error("Error getting GitHub access token:", error);
    return null;
  }
}

export async function createGitHubAPI(): Promise<GitHubAPI | null> {
  const accessToken = await getGitHubAccessToken();
  if (!accessToken) {
    return null;
  }
  return new GitHubAPI(accessToken);
}
