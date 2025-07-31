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
    url?: string;
  }
  
  /**
   * GitHub event types
   */
  export type GitHubEventType = 
    | 'PushEvent'
    | 'PullRequestEvent'
    | 'CreateEvent'
    | 'DeleteEvent'
    | 'ForkEvent'
    | 'WatchEvent'
    | 'IssuesEvent'
    | 'IssueCommentEvent'
    | 'ReleaseEvent'
    | 'CommitCommentEvent'
    | 'PublicEvent'
    | 'MemberEvent'
    | 'PullRequestReviewEvent'
    | 'PullRequestReviewCommentEvent'
    | 'GollumEvent';
  
  /**
   * Base GitHub activity
   */
  export interface GitHubActivity {
    id: string;
    type: GitHubEventType;
    created_at: string;
    actor: GitHubActor;
    repo: GitHubRepo;
    payload: GitHubEventPayload;
    public: boolean;
  }
  
  /**
   * GitHub pull request payload
   */
  export interface PullRequestPayload {
    action: 'opened' | 'closed' | 'reopened' | 'edited' | 'merged' | 'assigned' | 'unassigned' | 'review_requested' | 'review_request_removed';
    number: number;
    pull_request: {
      html_url: string;
      title: string;
      state: 'open' | 'closed';
      merged: boolean;
      user: {
        login: string;
      };
    };
  }
  
  /**
   * GitHub push event payload
   */
  export interface PushEventPayload {
    push_id: number;
    size: number;
    distinct_size: number;
    ref: string;
    head: string;
    before: string;
    commits: {
      sha: string;
      message: string;
      author: {
        name: string;
        email: string;
      };
      url: string;
    }[];
  }
  
  /**
   * GitHub create event payload
   */
  export interface CreateEventPayload {
    ref: string | null;
    ref_type: 'repository' | 'branch' | 'tag';
    master_branch: string;
    description: string | null;
  }
  
  /**
   * GitHub delete event payload
   */
  export interface DeleteEventPayload {
    ref: string;
    ref_type: 'branch' | 'tag';
  }
  
  /**
   * GitHub fork event payload
   */
  export interface ForkEventPayload {
    forkee: {
      id: number;
      name: string;
      full_name: string;
      html_url: string;
    };
  }
  
  /**
   * GitHub watch event payload
   */
  export interface WatchEventPayload {
    action: 'started';
  }
  
  /**
   * GitHub issues event payload
   */
  export interface IssuesEventPayload {
    action: 'opened' | 'closed' | 'reopened' | 'assigned' | 'unassigned' | 'labeled' | 'unlabeled';
    issue: {
      number: number;
      title: string;
      state: 'open' | 'closed';
      html_url: string;
      user: {
        login: string;
      };
    };
  }
  
  /**
   * GitHub issue comment event payload
   */
  export interface IssueCommentEventPayload {
    action: 'created' | 'edited' | 'deleted';
    issue: {
      number: number;
      title: string;
      state: 'open' | 'closed';
      html_url: string;
    };
    comment: {
      id: number;
      body: string;
      html_url: string;
      user: {
        login: string;
      };
    };
  }
  
  /**
   * GitHub release event payload
   */
  export interface ReleaseEventPayload {
    action: 'published' | 'created' | 'edited' | 'deleted' | 'prereleased' | 'released';
    release: {
      id: number;
      tag_name: string;
      name: string;
      body: string;
      html_url: string;
      draft: boolean;
      prerelease: boolean;
    };
  }
  
  /**
   * Union type for all GitHub event payloads
   */
  export type GitHubEventPayload =
    | PushEventPayload
    | PullRequestPayload
    | CreateEventPayload
    | DeleteEventPayload
    | ForkEventPayload
    | WatchEventPayload
    | IssuesEventPayload
    | IssueCommentEventPayload
    | ReleaseEventPayload
    | Record<string, any>;
  
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
    html_url?: string;
    description?: string;
    fork?: boolean;
    stargazers_count?: number;
    watchers_count?: number;
    forks_count?: number;
    open_issues_count?: number;
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
    contributionsByDate?: Record<string, number>;
    mostActiveRepo?: string;
  }
  
  /**
   * Complete GitHub data response
   */
  export interface GitHubData {
    activities: GitHubActivity[];
    commits: GitHubCommit[];
    stats: GitHubStats;
  }

  /**
   * GitHub activities section data
   */
  export interface GitHubActivityData {
    activities: GitHubActivity[];
    totalCount: number;
  } 