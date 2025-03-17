/**
 * GitHub actor (user) in an activity
 */
export interface GitHubActor {
    id: number;
    login: string;
    avatar_url: string;
  }
  
  /**
   * GitHub repository in an activity
   */
  export interface GitHubRepo {
    id: number;
    name: string;
  }
  
  /**
   * GitHub activity
   */
  export interface GitHubActivity {
    id: string;
    type: string;
    created_at: string;
    actor: GitHubActor;
    repo: GitHubRepo;
    payload: Record<string, any>;
  }
  
  /**
   * GitHub commit author
   */
  export interface GitHubCommitAuthor {
    name: string;
    email: string;
    date: string;
  }
  
  /**
   * GitHub commit details
   */
  export interface GitHubCommitDetails {
    author: GitHubCommitAuthor;
    message: string;
  }
  
  /**
   * GitHub repository details
   */
  export interface GitHubRepository {
    name: string;
    full_name: string;
  }
  
  /**
   * GitHub commit
   */
  export interface GitHubCommit {
    sha: string;
    commit: GitHubCommitDetails;
    html_url: string;
    repository: GitHubRepository;
  }
  
  /**
   * GitHub contribution statistics
   */
  export interface GitHubStats {
    totalCommits: number;
    totalPullRequests: number;
    totalIssues: number;
    contributionsByRepo: Record<string, number>;
  }
  
  /**
   * Complete GitHub data response
   */
  export interface GitHubData {
    activities: GitHubActivity[];
    commits: GitHubCommit[];
    stats: GitHubStats;
  } 