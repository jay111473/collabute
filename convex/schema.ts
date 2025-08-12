import { defineSchema, defineTable } from "convex/server";
import { v, Infer } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// ==============================
// ENUM VALIDATORS
// ==============================

export const UserTypeValidator = v.union(
  v.literal("DEVELOPER"),
  v.literal("STARTUP"),
  v.literal("DESIGNER"),
  v.literal("LEAD"),
  v.literal("PROJECT_MANAGER")
);

export const KycStatusValidator = v.union(
  v.literal("PENDING"),
  v.literal("VERIFIED"),
  v.literal("REJECTED")
);

export const ExperienceLevelValidator = v.union(
  v.literal("JUNIOR"),
  v.literal("MID_LEVEL"),
  v.literal("SENIOR"),
  v.literal("LEAD"),
  v.literal("ARCHITECT")
);

export const ProjectStatusValidator = v.union(
  v.literal("PLANNED"),
  v.literal("IN_PROGRESS"),
  v.literal("COMPLETED"),
  v.literal("ON_HOLD")
);

export const IssueStatusValidator = v.union(
  v.literal("OPEN"),
  v.literal("IN_PROGRESS"),
  v.literal("RESOLVED"),
  v.literal("CLOSED")
);

export const MessageTypeValidator = v.union(
  v.literal("TEXT"),
  v.literal("IMAGE"),
  v.literal("FILE"),
  v.literal("SYSTEM")
);

export const ApplicationStatusValidator = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("rejected"),
  v.literal("withdrawn")
);

export const BlogStatusValidator = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived")
);

// ==============================
// TYPE EXPORTS
// ==============================

export type UserType = Infer<typeof UserTypeValidator>;
export type KycStatus = Infer<typeof KycStatusValidator>;
export type ExperienceLevel = Infer<typeof ExperienceLevelValidator>;
export type ProjectStatus = Infer<typeof ProjectStatusValidator>;
export type IssueStatus = Infer<typeof IssueStatusValidator>;
export type MessageType = Infer<typeof MessageTypeValidator>;
export type ApplicationStatus = Infer<typeof ApplicationStatusValidator>;
export type BlogStatus = Infer<typeof BlogStatusValidator>;

// ==============================
// FIELD VALIDATORS
// ==============================

export const userFields = {
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  email: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
  profilePicture: v.optional(v.id("media")),
  type: v.optional(UserTypeValidator),
  phoneNumber: v.optional(v.string()),
  countryCode: v.optional(v.string()),
  country: v.optional(v.string()),
  industry: v.optional(v.string()),
  roleId: v.optional(v.id("roles")),
  isVerified: v.optional(v.boolean()),
  kycStatus: v.optional(KycStatusValidator),
  earlybird: v.optional(v.boolean()),
  wallet: v.optional(v.number()),
  projects: v.optional(v.array(v.id("projects"))),
  createdAt: v.optional(v.number()),
};

export const projectFields = {
  title: v.string(),
  slug: v.string(),
  description: v.string(),
  longDescription: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
  type: v.optional(v.string()),
  status: ProjectStatusValidator,
  state: v.optional(v.string()),
  startDate: v.number(),
  endDate: v.optional(v.number()),
  budget: v.optional(v.number()),
  isPublic: v.optional(v.boolean()),
  ownerId: v.id("users"),
  teamLeadId: v.optional(v.id("users")),
  stacks: v.optional(v.array(v.string())),
  tags: v.optional(v.array(v.string())),
  milestones: v.optional(v.any()),
  productId: v.optional(v.id("products")),
  repositoryId: v.optional(v.id("github_repositories")),
};

export const issueFields = {
  title: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  longDescription: v.optional(v.string()),
  type: v.optional(v.string()),
  category: v.optional(v.array(v.string())),
  status: IssueStatusValidator,
  priority: v.optional(v.string()),
  budget: v.optional(v.number()),
  onboardingVideoLink: v.optional(v.string()),
  onboardingVideoUrl: v.optional(v.string()),
  onboardingThumbnailUrl: v.optional(v.string()),
  projectId: v.id("projects"),
  assigneeIds: v.optional(v.array(v.id("users"))),
  reporterId: v.id("users"),
  labels: v.optional(v.array(v.string())),
  githubIssueNumber: v.optional(v.number()),
  githubUrl: v.optional(v.string()),
  lastSyncAt: v.optional(v.number()),
};

export const messageFields = {
  content: v.string(),
  type: MessageTypeValidator,
  conversationId: v.id("conversations"),
  senderId: v.id("users"),
  replyToId: v.optional(v.id("messages")),
  attachments: v.optional(v.array(v.id("media"))),
  isEdited: v.boolean(),
  editedAt: v.optional(v.number()),
  isDeleted: v.boolean(),
  deletedAt: v.optional(v.number()),
};

// ==============================
// SCHEMA DEFINITION
// ==============================

export default defineSchema({
  // Auth tables
  ...authTables,

  // ==============================
  // USER TABLES
  // ==============================

  users: defineTable(userFields).index("email", ["email"]),

  developer_profiles: defineTable({
    userId: v.id("users"),
    bio: v.optional(v.string()),
    skills: v.optional(
      v.array(
        v.object({
          skill: v.string(),
          level: v.optional(v.string()),
        })
      )
    ),
    experience: v.optional(v.number()),
    experienceLevel: v.optional(ExperienceLevelValidator),
    availability: v.optional(v.string()),
    preferredWorkType: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    stripeAccountId: v.optional(v.string()),
    stripeAccountStatus: v.optional(v.string()),
    portfolio: v.optional(v.array(v.string())),
    resumeUrl: v.optional(v.string()),
    resumeId: v.optional(v.id("media")),
    primaryRole: v.optional(v.array(v.string())),
    githubProfile: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_experience_level", ["experienceLevel"])
    .index("by_availability", ["availability"]),

  lead_profiles: defineTable({
    userId: v.id("users"),
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

  project_manager_profiles: defineTable({
    userId: v.id("users"),

    // Professional Experience
    professionalPMExperience: v.optional(v.string()), // "0-1 years", "2-3 years", etc.
    startupExperience: v.optional(v.string()),

    // Skills & Expertise
    projectSpecialties: v.optional(v.array(v.string())), // From wizard: SaaS, E-commerce, etc.

    // Social Profiles
    personalWebsite: v.optional(v.string()),
    githubProfile: v.optional(v.string()),
    xProfile: v.optional(v.string()),

    // Work Preferences
    availabilityHours: v.optional(v.string()), // "1-2 hours", "3-4 hours", etc.

    // Professional Values (from wizard)
    greatSoftwareDefinition: v.optional(v.string()), // How they define great software
    projectManagementDescription: v.optional(v.string()), // Do you manage projects or people?
  })
    .index("by_user", ["userId"])
    .index("by_availability", ["availabilityHours"]),

  designer_profiles: defineTable({
    userId: v.id("users"),

    // Portfolio & Social Profiles
    portfolioType: v.optional(v.string()), // "Personal Website (Preferred)", "PDF Portfolio", "Figma/Adobe XD Link"
    portfolioUrl: v.optional(v.string()),
    dribbbleProfile: v.optional(v.string()),
    behanceProfile: v.optional(v.string()),
    layersProfile: v.optional(v.string()),

    // Experience
    professionalDesignExperience: v.optional(v.string()),
    startupExperience: v.optional(v.string()),
    resumeUrl: v.optional(v.string()),
    resumeId: v.optional(v.id("media")),
    designWorkTypes: v.optional(v.array(v.string())),

    // Availability & Working Style
    availabilityHours: v.optional(v.string()),
    qualityOverDelivery: v.optional(v.string()),
    favoriteProducts: v.optional(v.string()),

    // Additional designer-specific fields
    bio: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    isAvailable: v.optional(v.boolean()),
    lastActive: v.optional(v.number()),
    completedProjects: v.optional(v.number()),
    rating: v.optional(v.number()),
    reviews: v.optional(v.array(v.any())),
    certifications: v.optional(v.array(v.string())),
    languages: v.optional(v.array(v.string())),
    timezone: v.optional(v.string()),
    workingHours: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_availability", ["availabilityHours"])
    .index("by_design_experience", ["professionalDesignExperience"]),

  startup_profiles: defineTable({
    userId: v.id("users"),
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

  github_profiles: defineTable({
    userId: v.id("users"),
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

  // ==============================
  // PROJECT TABLES
  // ==============================

  projects: defineTable(projectFields)
    .index("by_owner", ["ownerId"])
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_product", ["productId"]),

  project_collaborators: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    status: v.optional(v.string()),
    joinedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_project_user", ["projectId", "userId"]),

  // ==============================
  // ISSUE TABLES
  // ==============================

  issues: defineTable(issueFields)
    .index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_reporter", ["reporterId"])
    .index("by_slug", ["slug"])
    .index("by_github_number", ["githubIssueNumber", "projectId"]),

  issue_applications: defineTable({
    issueId: v.id("issues"),
    applicantId: v.id("users"),
    proposal: v.string(),
    attachments: v.optional(v.array(v.id("media"))),
    status: ApplicationStatusValidator,
    appliedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedById: v.optional(v.id("users")),
  })
    .index("by_issue", ["issueId"])
    .index("by_applicant", ["applicantId"])
    .index("by_status", ["status"]),

  collaboration_requests: defineTable({
    developerId: v.id("users"),
    issueId: v.id("issues"),
    percentageShare: v.number(),
    taskDefinition: v.optional(v.string()),
    status: v.optional(v.string()),
    requestedAt: v.number(),
  })
    .index("by_developer", ["developerId"])
    .index("by_issue", ["issueId"])
    .index("by_status", ["status"]),

  // ==============================
  // GITHUB INTEGRATION
  // ==============================

  github_repositories: defineTable({
    githubId: v.number(),
    name: v.string(),
    fullName: v.string(),
    description: v.optional(v.string()),
    ownerId: v.id("users"),
    private: v.boolean(),
    htmlUrl: v.string(),
    cloneUrl: v.string(),
    language: v.optional(v.string()),
    stargazersCount: v.number(),
    forksCount: v.number(),
    defaultBranch: v.string(),
    isActive: v.boolean(),
    lastSyncAt: v.number(),
    projectId: v.optional(v.id("projects")),
  })
    .index("by_github_id", ["githubId"])
    .index("by_owner", ["ownerId"])
    .index("by_project", ["projectId"])
    .index("by_full_name", ["fullName"]),

  // ==============================
  // COMMUNICATION TABLES
  // ==============================

  conversations: defineTable({
    title: v.string(),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    description: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    isArchived: v.boolean(),
    archivedAt: v.optional(v.number()),
    messageCount: v.number(),
    projectId: v.optional(v.id("projects")),
    createdById: v.optional(v.id("users")),
    lastMessageId: v.optional(v.id("messages")),
  })
    .index("by_project", ["projectId"])
    .index("by_creator", ["createdById"])
    .index("by_type", ["type"]),

  conversation_participants: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    role: v.optional(v.string()),
    joinedAt: v.number(),
    leftAt: v.optional(v.number()),
    lastReadMessageId: v.optional(v.id("messages")),
    notifications: v.optional(v.string()),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_user", ["userId"])
    .index("by_conversation_user", ["conversationId", "userId"]),

  messages: defineTable(messageFields)
    .index("by_conversation", ["conversationId"])
    .index("by_sender", ["senderId"])
    .index("by_reply_to", ["replyToId"]),

  // ==============================
  // UTILITY TABLES
  // ==============================

  media: defineTable({
    userId: v.id("users"),
    url: v.string(), // Keep for backward compatibility
    storageId: v.optional(v.id("_storage")), // Add storageId for fresh URL generation
    type: v.optional(v.string()),
    createdAt: v.number(),
    description: v.optional(v.string()),
    // File upload fields
    title: v.optional(v.string()),
    originalFilename: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    uploadedBy: v.optional(v.id("users")),
    tags: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    uploadedAt: v.optional(v.number()),
  }),

  transactions: defineTable({
    userId: v.id("users"),
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

  // ==============================
  // BLOG TABLES
  // ==============================

  blogs: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    profilePicture: v.optional(v.id("media")),
    thumbnail: v.optional(v.id("media")),
    category: v.optional(v.id("categories")),
    tags: v.optional(v.array(v.id("tags"))),
    content: v.optional(v.any()), // Tiptap JSON content
    status: v.optional(BlogStatusValidator),
    publishedAt: v.optional(v.number()),
    updatedAt: v.number(),
    meta: v.optional(
      v.object({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        image: v.optional(v.id("media")),
      })
    ),
    faq: v.optional(
      v.array(
        v.object({
          id: v.optional(v.string()),
          question: v.optional(v.string()),
          answer: v.optional(v.string()),
        })
      )
    ),
    authorId: v.optional(v.id("users")),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_author", ["authorId"])
    .index("by_published", ["publishedAt"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_name", ["name"]),

  tags: defineTable({
    name: v.string(),
    slug: v.string(),
    color: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_name", ["name"]),

  invitations: defineTable({
    email: v.string(),
    token: v.string(),
    type: v.string(), // e.g., "PROJECT_MANAGER"
    projectName: v.optional(v.string()),
    inviterName: v.optional(v.string()),
    status: v.string(), // "PENDING", "ACCEPTED", "EXPIRED"
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
  })
    .index("by_token", ["token"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  // ==============================
  // TECH STACK COLLECTION
  // ==============================

  tech_stacks: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()), // e.g., "frontend", "backend", "database", "mobile", "devops"
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_name", ["name"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  // Security audit logs
  audit_logs: defineTable({
    userId: v.optional(v.id("users")), // Who performed the action (null for system)
    action: v.string(), // What action was performed
    targetUserId: v.optional(v.id("users")), // Who was affected (if applicable)
    details: v.optional(v.string()), // Additional details about the action
    ipAddress: v.optional(v.string()), // IP address of the user
    userAgent: v.optional(v.string()), // User agent string
    timestamp: v.number(), // When the action occurred
  })
    .index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_timestamp", ["timestamp"])
    .index("by_target_user", ["targetUserId"]),

  // ==============================
  // WIZARD DATA TABLE (TEMPORARY)
  // ==============================

  wizard_data: defineTable({
    email: v.string(),
    name: v.string(),
    phoneNumber: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    type: UserTypeValidator,
    teamLeadFields: v.optional(v.any()),
    designerFields: v.optional(v.any()),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_created_at", ["createdAt"])
    .index("by_expires_at", ["expiresAt"]),
});
