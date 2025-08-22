import { Doc, Id } from "../convex/_generated/dataModel";
import { WithoutSystemFields } from "convex/server";
import {
  UserType,
  KycStatus,
  ExperienceLevel,
  ProjectStatus,
  IssueStatus,
  MessageType,
  UserTypeValidator,
  KycStatusValidator,
  ExperienceLevelValidator,
  ProjectStatusValidator,
  IssueStatusValidator,
  MessageTypeValidator,
  userFields,
  projectFields,
  issueFields,
  messageFields,
} from "../convex/schema";

// Re-export schema types and validators
export type {
  UserType,
  KycStatus,
  ExperienceLevel,
  ProjectStatus,
  IssueStatus,
  MessageType,
  UserTypeValidator,
  KycStatusValidator,
  ExperienceLevelValidator,
  ProjectStatusValidator,
  IssueStatusValidator,
  MessageTypeValidator,
  userFields,
  projectFields,
  issueFields,
  messageFields,
};

// Document types for all tables
export type User = Doc<"users">;
export type Media = Doc<"media">;
export type DeveloperProfile = Doc<"developer_profiles">;
export type LeadProfile = Doc<"lead_profiles">;
export type ProjectManagerProfile = Doc<"project_manager_profiles">;
export type StartupProfile = Doc<"startup_profiles">;
export type GithubProfile = Doc<"github_profiles">;
export type Role = Doc<"roles">;
export type Project = Doc<"projects">;
export type ProjectCollaborator = Doc<"project_collaborators">;
export type Issue = Doc<"issues">;
export type IssueApplication = Doc<"issue_applications">;
export type CollaborationRequest = Doc<"collaboration_requests">;
export type GithubRepository = Doc<"github_repositories">;
export type Conversation = Doc<"conversations">;
export type ConversationParticipant = Doc<"conversation_participants">;
export type Message = Doc<"messages">;
export type Transaction = Doc<"transactions">;
export type Product = Doc<"products">;
export type Blog = Doc<"blogs">;
export type Category = Doc<"categories">;
export type Tag = Doc<"tags">;

// ID types for all tables
export type UserId = Id<"users">;
export type MediaId = Id<"media">;
export type DeveloperProfileId = Id<"developer_profiles">;
export type LeadProfileId = Id<"lead_profiles">;
export type ProjectManagerProfileId = Id<"project_manager_profiles">;
export type StartupProfileId = Id<"startup_profiles">;
export type GithubProfileId = Id<"github_profiles">;
export type RoleId = Id<"roles">;
export type ProjectId = Id<"projects">;
export type ProjectCollaboratorId = Id<"project_collaborators">;
export type IssueId = Id<"issues">;
export type CollaborationRequestId = Id<"collaboration_requests">;
export type GithubRepositoryId = Id<"github_repositories">;
export type ConversationId = Id<"conversations">;
export type ConversationParticipantId = Id<"conversation_participants">;
export type MessageId = Id<"messages">;
export type TransactionId = Id<"transactions">;
export type ProductId = Id<"products">;
export type BlogId = Id<"blogs">;
export type CategoryId = Id<"categories">;
export type TagId = Id<"tags">;

// Insert types (without system fields) for mutations
export type UserInsert = WithoutSystemFields<User>;
export type MediaInsert = WithoutSystemFields<Media>;
export type DeveloperProfileInsert = WithoutSystemFields<DeveloperProfile>;
export type LeadProfileInsert = WithoutSystemFields<LeadProfile>;
export type ProjectManagerProfileInsert =
  WithoutSystemFields<ProjectManagerProfile>;
export type StartupProfileInsert = WithoutSystemFields<StartupProfile>;
export type GithubProfileInsert = WithoutSystemFields<GithubProfile>;
export type RoleInsert = WithoutSystemFields<Role>;
export type ProjectInsert = WithoutSystemFields<Project>;
export type ProjectCollaboratorInsert =
  WithoutSystemFields<ProjectCollaborator>;
export type IssueInsert = WithoutSystemFields<Issue>;
export type CollaborationRequestInsert =
  WithoutSystemFields<CollaborationRequest>;
export type GithubRepositoryInsert = WithoutSystemFields<GithubRepository>;
export type ConversationInsert = WithoutSystemFields<Conversation>;
export type ConversationParticipantInsert =
  WithoutSystemFields<ConversationParticipant>;
export type MessageInsert = WithoutSystemFields<Message>;
export type TransactionInsert = WithoutSystemFields<Transaction>;
export type ProductInsert = WithoutSystemFields<Product>;
export type BlogInsert = WithoutSystemFields<Blog>;
export type CategoryInsert = WithoutSystemFields<Category>;
export type TagInsert = WithoutSystemFields<Tag>;

// Partial update types for mutations
export type UserUpdate = Partial<UserInsert>;
export type MediaUpdate = Partial<MediaInsert>;
export type DeveloperProfileUpdate = Partial<DeveloperProfileInsert>;
export type LeadProfileUpdate = Partial<LeadProfileInsert>;
export type ProjectManagerProfileUpdate = Partial<ProjectManagerProfileInsert>;
export type StartupProfileUpdate = Partial<StartupProfileInsert>;
export type GithubProfileUpdate = Partial<GithubProfileInsert>;
export type RoleUpdate = Partial<RoleInsert>;
export type ProjectUpdate = Partial<ProjectInsert>;
export type ProjectCollaboratorUpdate = Partial<ProjectCollaboratorInsert>;
export type IssueUpdate = Partial<IssueInsert>;
export type CollaborationRequestUpdate = Partial<CollaborationRequestInsert>;
export type GithubRepositoryUpdate = Partial<GithubRepositoryInsert>;
export type ConversationUpdate = Partial<ConversationInsert>;
export type ConversationParticipantUpdate =
  Partial<ConversationParticipantInsert>;
export type MessageUpdate = Partial<MessageInsert>;
export type TransactionUpdate = Partial<TransactionInsert>;
export type ProductUpdate = Partial<ProductInsert>;
export type BlogUpdate = Partial<BlogInsert>;
export type CategoryUpdate = Partial<CategoryInsert>;
export type TagUpdate = Partial<TagInsert>;

// Common filter types for queries
export type UserFilter = {
  userId?: string;
  email?: string;
  type?: UserType;
  kycStatus?: KycStatus;
  isVerified?: boolean;
};

export type ProjectFilter = {
  ownerId?: UserId;
  status?: ProjectStatus;
  type?: string;
};

export type IssueFilter = {
  projectId?: ProjectId;
  status?: IssueStatus;
  reporterId?: string;
  assigneeIds?: string[];
};

export type MessageFilter = {
  conversationId?: ConversationId;
  senderId?: UserId;
  type?: MessageType;
};

// Utility types for common operations
export type PaginationArgs = {
  limit?: number;
  cursor?: string;
};

export type SortOrder = "asc" | "desc";

export type SearchArgs = {
  query?: string;
  limit?: number;
};

// Profile union type for user profiles
export type UserProfile =
  | DeveloperProfile
  | LeadProfile
  | ProjectManagerProfile
  | StartupProfile;

// Message with populated user data
export type MessageWithUser = Message & {
  sender: User;
};

// Enhanced message type as returned by chat functions
export type EnhancedMessage = Message & {
  id: string; // Backward compatibility
  createdAt: string;
  updatedAt?: string; // Optional since not all messages have this field
  sender: {
    _id: Id<"users">;
    id: Id<"users">;
    name: string;
    email?: string;
    profilePicture?: Media | null;
  } | null;
  replyTo?: Message | null;
  isOptimistic?: boolean;
};

// Project with populated data
export type ProjectWithDetails = Project & {
  owner: User;
  teamLead?: User;
  collaborators: ProjectCollaborator[];
  repository?: GithubRepository;
};

// Issue with populated data
export type IssueWithDetails = Issue & {
  project: Project;
  assignees: User[];
  reporter: User;
};

// Blog with populated data
export type BlogWithDetails = Blog & {
  category: Category | null;
  tags: (Tag | null)[];
  profilePicture: Media | null;
  thumbnail: Media | null;
  author: User | null;
  meta?: {
    title?: string;
    description?: string;
    image: Media | null;
  };
};

// Project with populated team lead
export type ProjectWithTeamLead = Project & {
  teamLead: User | null;
};

// Product with populated projects (including team leads)
export type ProductWithProjects = Product & {
  projects: ProjectWithTeamLead[];
};

// Request data combining collaboration requests and issue applications
export type IssueRequest = {
  _id: string;
  requestStatus: string | undefined;
  applicantId?: Id<"users">;
  developerId?: Id<"users">;
  appliedAt?: number;
  requestedAt?: number;
};

// Request counts for performance
export type RequestCounts = {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
};

// Issue with populated request data
export type IssueWithRequests = Issue & {
  project: Project | null;
  requests: IssueRequest[];
  requestCounts: RequestCounts;
};

// Enhanced project type as returned by getAllProjects API
export type EnhancedProject = Omit<
  Project,
  "startDate" | "endDate" | "tags"
> & {
  // Date fields transformed to ISO strings
  startDate: string;
  endDate: string | null;
  updatedAt: string;

  // Populated owner with media - includes profilePicture media object
  owner:
    | (User & {
        profilePicture: Media | null;
      })
    | null;

  // Populated team lead with media - includes profilePicture media object
  teamLead:
    | (User & {
        profilePicture: Media | null;
      })
    | null;

  // Additional counts
  issueCount: number;
  collaboratorCount: number;

  // Enhanced fields - tags is transformed to objects with tag and id
  stacks: string[];
  tags: { tag: string; id: string }[];

  progress?: number;
  deadlineText?: string;
  budget?: number;
  createdAt?: string;

  // Milestones field from the actual return
  milestones: {
    ideaRefinement: string;
    documentation: string;
    design: string;
    development: string;
    testing: string;
    launch: string;
    maintenance: string;
    scaling: string;
  };
};

export type ExplorePageData = {
  typeCounts: {
    "Back-end": number;
    "Front-end": number;
    "QA / Test": number;
    Deployment: number;
    Design: number;
  };
  featuredProjects: EnhancedProject[];
  allProjects: EnhancedProject[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProjects: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
};

export type ConversationParticipantWithUser = ConversationParticipant & {
  user: {
    _id: Id<"users">;
    name?: string;
    email?: string;
    image?: Id<"media"> | null;
    profilePicture?: Id<"media"> | null;
  } | null;
};

// Skill types
export type Skill = {
  skill: string;
  level?: string;
};

// GitHub API types
export type GitHubRepository = {
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
  owner: {
    login: string;
  };
};

export type GitHubActivity = {
  id: string;
  type: string;
  actor: {
    login: string;
  };
  repo: {
    name: string;
  };
  payload: Record<string, unknown>;
  created_at: string;
};

export type GitHubUserProfile = {
  id: number;
  login: string;
  public_repos: number;
  followers: number;
  following: number;
  name?: string;
  email?: string;
  avatar_url?: string;
};
