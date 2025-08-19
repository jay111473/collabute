import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

interface RateLimitInfo {
  remaining: number;
  reset: number;
  used: number;
  limit: number;
}

/**
 * Rate-limited GitHub API client for sync operations
 */
export class GitHubSyncClient {
  private octokit: Octokit;
  private rateLimit: RateLimitInfo = {
    remaining: 5000,
    reset: Date.now() + 60 * 60 * 1000, // 1 hour from now
    used: 0,
    limit: 5000,
  };

  constructor(installationId: string) {
    this.octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: process.env.GITHUB_APP_ID!,
        privateKey: process.env.GITHUB_PRIVATE_KEY!,
        installationId,
      },
    });
  }

  /**
   * Make a rate-limited request to GitHub API
   */
  private async makeRequest<T>(fn: () => Promise<T>): Promise<T> {
    // Check if we need to wait for rate limit reset
    if (this.rateLimit.remaining < 100 && Date.now() < this.rateLimit.reset * 1000) {
      const waitTime = this.rateLimit.reset * 1000 - Date.now();
      console.log(`Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 60000))); // Max 1 minute wait
    }

    try {
      const result = await fn();
      
      // Update rate limit info from response headers if available
      this.updateRateLimitFromResponse(result);
      
      return result;
    } catch (error: any) {
      // Handle rate limit errors
      if (error.status === 403 && error.response?.headers?.['x-ratelimit-remaining']) {
        this.updateRateLimitFromHeaders(error.response.headers);
        throw new Error(`GitHub API rate limit exceeded. Reset at: ${new Date(this.rateLimit.reset * 1000)}`);
      }
      
      // Handle other GitHub API errors
      if (error.status === 404) {
        throw new Error(`GitHub resource not found: ${error.message}`);
      }
      
      if (error.status === 401) {
        throw new Error(`GitHub authentication failed: ${error.message}`);
      }
      
      throw error;
    }
  }

  /**
   * Update rate limit info from response headers
   */
  private updateRateLimitFromResponse(response: any) {
    if (response?.headers) {
      this.updateRateLimitFromHeaders(response.headers);
    }
  }

  /**
   * Update rate limit info from headers object
   */
  private updateRateLimitFromHeaders(headers: any) {
    const remaining = headers['x-ratelimit-remaining'];
    const reset = headers['x-ratelimit-reset'];
    const used = headers['x-ratelimit-used'];
    const limit = headers['x-ratelimit-limit'];

    if (remaining !== undefined) {
      this.rateLimit = {
        remaining: parseInt(remaining),
        reset: parseInt(reset),
        used: parseInt(used || '0'),
        limit: parseInt(limit || '5000'),
      };
    }
  }

  /**
   * Get current rate limit status
   */
  getRateLimit(): RateLimitInfo {
    return { ...this.rateLimit };
  }

  // ====================================
  // REPOSITORY OPERATIONS
  // ====================================

  /**
   * Fetch repository information
   */
  async getRepository(owner: string, repo: string) {
    return this.makeRequest(() =>
      this.octokit.rest.repos.get({ owner, repo })
    );
  }

  /**
   * List repositories accessible to the installation
   */
  async listRepositories(perPage = 100) {
    return this.makeRequest(() =>
      this.octokit.rest.apps.listReposAccessibleToInstallation({
        per_page: perPage,
      })
    );
  }

  /**
   * Create a new repository
   */
  async createRepository(name: string, options: {
    description?: string;
    private?: boolean;
    autoInit?: boolean;
    gitignoreTemplate?: string;
    licenseTemplate?: string;
  } = {}) {
    return this.makeRequest(() =>
      this.octokit.rest.repos.createForAuthenticatedUser({
        name,
        description: options.description,
        private: options.private ?? false,
        auto_init: options.autoInit ?? true,
        gitignore_template: options.gitignoreTemplate,
        license_template: options.licenseTemplate,
      })
    );
  }

  // ====================================
  // ISSUE OPERATIONS
  // ====================================

  /**
   * List issues for a repository
   */
  async listIssues(owner: string, repo: string, options: {
    state?: 'open' | 'closed' | 'all';
    since?: string;
    perPage?: number;
    page?: number;
  } = {}) {
    return this.makeRequest(() =>
      this.octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: options.state ?? 'all',
        since: options.since,
        per_page: options.perPage ?? 100,
        page: options.page ?? 1,
      })
    );
  }

  /**
   * Get a specific issue
   */
  async getIssue(owner: string, repo: string, issueNumber: number) {
    return this.makeRequest(() =>
      this.octokit.rest.issues.get({
        owner,
        repo,
        issue_number: issueNumber,
      })
    );
  }

  /**
   * Create a new issue
   */
  async createIssue(owner: string, repo: string, options: {
    title: string;
    body?: string;
    assignees?: string[];
    labels?: string[];
  }) {
    return this.makeRequest(() =>
      this.octokit.rest.issues.create({
        owner,
        repo,
        title: options.title,
        body: options.body,
        assignees: options.assignees,
        labels: options.labels,
      })
    );
  }

  /**
   * Update an issue
   */
  async updateIssue(owner: string, repo: string, issueNumber: number, options: {
    title?: string;
    body?: string;
    state?: 'open' | 'closed';
    assignees?: string[];
    labels?: string[];
  }) {
    return this.makeRequest(() =>
      this.octokit.rest.issues.update({
        owner,
        repo,
        issue_number: issueNumber,
        title: options.title,
        body: options.body,
        state: options.state,
        assignees: options.assignees,
        labels: options.labels,
      })
    );
  }

  // ====================================
  // COLLABORATOR OPERATIONS
  // ====================================

  /**
   * List repository collaborators
   */
  async listCollaborators(owner: string, repo: string, perPage = 100) {
    return this.makeRequest(() =>
      this.octokit.rest.repos.listCollaborators({
        owner,
        repo,
        per_page: perPage,
      })
    );
  }

  /**
   * Get collaborator permission level
   */
  async getCollaboratorPermission(owner: string, repo: string, username: string) {
    return this.makeRequest(() =>
      this.octokit.rest.repos.getCollaboratorPermissionLevel({
        owner,
        repo,
        username,
      })
    );
  }

  /**
   * Add a collaborator to repository
   */
  async addCollaborator(owner: string, repo: string, username: string, permission: 'pull' | 'push' | 'admin' = 'push') {
    return this.makeRequest(() =>
      this.octokit.rest.repos.addCollaborator({
        owner,
        repo,
        username,
        permission,
      })
    );
  }

  /**
   * Remove a collaborator from repository
   */
  async removeCollaborator(owner: string, repo: string, username: string) {
    return this.makeRequest(() =>
      this.octokit.rest.repos.removeCollaborator({
        owner,
        repo,
        username,
      })
    );
  }

  // ====================================
  // BATCH OPERATIONS
  // ====================================

  /**
   * Sync all data for a repository
   */
  async syncRepositoryData(owner: string, repo: string) {
    const [repositoryData, issues, collaborators] = await Promise.all([
      this.getRepository(owner, repo),
      this.listIssues(owner, repo, { state: 'all' }),
      this.listCollaborators(owner, repo),
    ]);

    return {
      repository: repositoryData.data,
      issues: issues.data,
      collaborators: collaborators.data,
    };
  }

  /**
   * Batch create issues
   */
  async batchCreateIssues(owner: string, repo: string, issues: Array<{
    title: string;
    body?: string;
    assignees?: string[];
    labels?: string[];
  }>) {
    const results = [];
    
    for (const issue of issues) {
      try {
        const result = await this.createIssue(owner, repo, issue);
        results.push({ success: true, data: result.data });
        
        // Small delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.push({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error),
          issue: issue.title 
        });
      }
    }
    
    return results;
  }
}