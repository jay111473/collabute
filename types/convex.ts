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
export type UserProfile = DeveloperProfile | LeadProfile | StartupProfile;

// Message with populated user data
export type MessageWithUser = Message & {
  sender: User;
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
