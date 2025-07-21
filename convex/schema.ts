import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Enums
const UserType = v.union(
  v.literal("DEVELOPER"),
  v.literal("STARTUP"),
  v.literal("DESIGNER"),
  v.literal("LEAD"),
  v.literal("PROJECT_MANAGER")
);

const KycStatus = v.union(
  v.literal("PENDING"),
  v.literal("VERIFIED"),
  v.literal("REJECTED")
);

const ExperienceLevel = v.union(
  v.literal("JUNIOR"),
  v.literal("MID_LEVEL"),
  v.literal("SENIOR"),
  v.literal("LEAD"),
  v.literal("ARCHITECT")
);

const ProjectStatus = v.union(
  v.literal("PLANNED"),
  v.literal("IN_PROGRESS"),
  v.literal("COMPLETED"),
  v.literal("ON_HOLD")
);

const IssueStatus = v.union(
  v.literal("OPEN"),
  v.literal("IN_PROGRESS"),
  v.literal("RESOLVED"),
  v.literal("CLOSED")
);

const MessageType = v.union(
  v.literal("TEXT"),
  v.literal("IMAGE"),
  v.literal("FILE"),
  v.literal("SYSTEM")
);

export default defineSchema({
  // Unified user table (BetterAuth + business logic)
  user: defineTable({
    // BetterAuth fields
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),

    // Business logic fields (merged from users table)
    profilePicture: v.optional(v.string()),
    type: UserType,
    phoneNumber: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    country: v.optional(v.string()),
    industry: v.optional(v.string()),
    roleId: v.optional(v.id("roles")),
    isVerified: v.boolean(),
    kycStatus: KycStatus,
    earlybird: v.boolean(),
    wallet: v.number(),
  })
    .index("email", ["email"])
    .index("by_type", ["type"]),

  session: defineTable({
    sessionToken: v.string(),
    userId: v.id("user"),
    expires: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("sessionToken", ["sessionToken"])
    .index("userId", ["userId"]),

  account: defineTable({
    userId: v.id("user"),
    type: v.string(),
    provider: v.string(),
    providerAccountId: v.string(),
    refresh_token: v.optional(v.string()),
    access_token: v.optional(v.string()),
    expires_at: v.optional(v.number()),
    token_type: v.optional(v.string()),
    scope: v.optional(v.string()),
    id_token: v.optional(v.string()),
    session_state: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("provider_providerAccountId", ["provider", "providerAccountId"]),

  verificationToken: defineTable({
    identifier: v.string(),
    token: v.string(),
    expires: v.number(),
    createdAt: v.number(),
  })
    .index("identifier", ["identifier"])
    .index("token", ["token"]),

  // Developer-specific profile data
  developer_profiles: defineTable({
    userId: v.id("user"),
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    experience: v.optional(v.number()),
    experienceLevel: v.optional(ExperienceLevel),
    availability: v.optional(v.string()),
    preferredWorkType: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    stripeAccountId: v.optional(v.string()),
    stripeAccountStatus: v.optional(v.string()),
    portfolio: v.optional(v.array(v.string())),
    resumeUrl: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_experience_level", ["experienceLevel"])
    .index("by_availability", ["availability"]),

  // Lead/Manager-specific profile data
  lead_profiles: defineTable({
    userId: v.id("user"),
    specializations: v.optional(v.array(v.string())),
    title: v.optional(v.string()),
    location: v.optional(v.string()),
    calendar: v.optional(v.array(v.any())),
    preferredPayment: v.optional(v.string()),
    companyName: v.optional(v.string()),
    companySize: v.optional(v.string()),
    managementExperience: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_specialization", ["specializations"])
    .index("by_location", ["location"]),

  // Startup-specific profile data
  startup_profiles: defineTable({
    userId: v.id("user"),
    companyName: v.string(),
    companyDescription: v.optional(v.string()),
    website: v.optional(v.string()),
    fundingStage: v.optional(v.string()),
    teamSize: v.optional(v.number()),
    industry: v.optional(v.string()),
    foundedYear: v.optional(v.number()),
    businessModel: v.optional(v.string()),
    targetMarket: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_company", ["companyName"])
    .index("by_funding_stage", ["fundingStage"]),

  // GitHub integration data - separate table for better performance
  github_profiles: defineTable({
    userId: v.id("user"),
    githubId: v.string(),
    githubUsername: v.string(),
    githubConnected: v.boolean(),
    githubConnectedAt: v.number(),
    githubAccessToken: v.optional(v.string()),
    githubInstallationId: v.optional(v.string()),
    githubLastFetch: v.optional(v.number()),
    publicRepos: v.optional(v.number()),
    followers: v.optional(v.number()),
    following: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_github_id", ["githubId"])
    .index("by_github_username", ["githubUsername"]),

  roles: defineTable({
    name: v.string(),
    displayName: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    permissions: v.array(v.string()),
  }).index("by_name", ["name"]),

  projects: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    longDescription: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    type: v.optional(v.string()),
    status: ProjectStatus,
    state: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    budget: v.optional(v.number()),

    // Owner and Team
    ownerId: v.id("user"),
    teamLeadId: v.optional(v.id("user")),

    // Technical
    stacks: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),

    // Milestones stored as object
    milestones: v.optional(v.any()),

    // Product Association
    productId: v.optional(v.id("products")),

    // Repository
    repositoryId: v.optional(v.id("github_repositories")),
  })
    .index("by_owner", ["ownerId"])
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  project_collaborators: defineTable({
    projectId: v.id("projects"),
    userId: v.id("user"),
    status: v.optional(v.string()),
    joinedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_project_user", ["projectId", "userId"]),

  issues: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    longDescription: v.optional(v.string()),
    type: v.optional(v.string()),
    category: v.optional(v.array(v.string())),
    status: IssueStatus,
    priority: v.optional(v.string()),
    budget: v.optional(v.number()),

    // Media
    onboardingVideoLink: v.optional(v.string()),
    onboardingVideoUrl: v.optional(v.string()),
    onboardingThumbnailUrl: v.optional(v.string()),

    // Relationships
    projectId: v.id("projects"),
    assigneeIds: v.optional(v.array(v.id("user"))),
    reporterId: v.id("user"),

    // Labels
    labels: v.optional(v.array(v.string())),

    // GitHub integration fields
    githubIssueNumber: v.optional(v.number()),
    githubUrl: v.optional(v.string()),
    lastSyncAt: v.optional(v.number()),
  })
    .index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_reporter", ["reporterId"])
    .index("by_slug", ["slug"])
    .index("by_github_number", ["githubIssueNumber", "projectId"]),

  collaboration_requests: defineTable({
    developerId: v.id("user"),
    issueId: v.id("issues"),
    percentageShare: v.number(),
    taskDefinition: v.optional(v.string()),
    status: v.optional(v.string()),
    requestedAt: v.number(),
  })
    .index("by_developer", ["developerId"])
    .index("by_issue", ["issueId"])
    .index("by_status", ["status"]),

  github_repositories: defineTable({
    githubId: v.number(),
    name: v.string(),
    fullName: v.string(),
    description: v.optional(v.string()),
    ownerId: v.id("user"),
    private: v.boolean(),
    htmlUrl: v.string(),
    cloneUrl: v.string(),
    language: v.optional(v.string()),
    stargazersCount: v.number(),
    forksCount: v.number(),
    defaultBranch: v.string(),
    isActive: v.boolean(),
    lastSyncAt: v.number(),

    // Project association
    projectId: v.optional(v.id("projects")),
  })
    .index("by_github_id", ["githubId"])
    .index("by_owner", ["ownerId"])
    .index("by_project", ["projectId"])
    .index("by_full_name", ["fullName"]),

  conversations: defineTable({
    title: v.string(),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    description: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    isArchived: v.boolean(),
    archivedAt: v.optional(v.number()),
    messageCount: v.number(),

    // Relationships
    projectId: v.optional(v.id("projects")),
    createdById: v.optional(v.id("user")),
    lastMessageId: v.optional(v.id("messages")),
  })
    .index("by_project", ["projectId"])
    .index("by_creator", ["createdById"])
    .index("by_type", ["type"]),

  conversation_participants: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("user"),
    role: v.optional(v.string()),
    joinedAt: v.number(),
    leftAt: v.optional(v.number()),
    lastReadMessageId: v.optional(v.id("messages")),
    notifications: v.optional(v.string()),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_user", ["userId"])
    .index("by_conversation_user", ["conversationId", "userId"]),

  messages: defineTable({
    content: v.string(),
    type: MessageType,

    // Relationships
    conversationId: v.id("conversations"),
    senderId: v.id("user"),
    replyToId: v.optional(v.id("messages")),

    // Media
    attachments: v.optional(v.array(v.string())),

    // Status
    isEdited: v.boolean(),
    editedAt: v.optional(v.number()),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_sender", ["senderId"])
    .index("by_reply_to", ["replyToId"]),

  transactions: defineTable({
    userId: v.id("user"),
    amount: v.number(),
    type: v.string(),
    method: v.string(),
    status: v.string(),
    reference: v.optional(v.string()),
    description: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_status", ["status"]),

  products: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    price: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),
});
