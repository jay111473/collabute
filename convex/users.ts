import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { KycStatusValidator } from "./schema";
import { Scrypt } from "lucia";

export const getUserProfile = query({
  args: { authUserId: v.id("users") },
  handler: async (ctx, args) => {
    // With unified table, just return the user directly
    return await ctx.db.get(args.authUserId);
  },
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    updates: v.object({
      profilePicture: v.optional(v.string()),
      type: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
      countryCode: v.optional(v.string()),
      country: v.optional(v.string()),
      industry: v.optional(v.string()),
      kycStatus: v.optional(v.union(KycStatusValidator)), // e.g., "VERIFIED", "PENDING", "REJECTED"
    }),
  },
  handler: async (ctx, args) => {
    // Remove undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(args.updates).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(filteredUpdates).length > 0) {
      await ctx.db.patch(args.userId, filteredUpdates as any);
    }

    return true;
  },
});

export const updateGitHubData = mutation({
  args: {
    userId: v.id("users"),
    githubData: v.object({
      githubId: v.string(),
      githubUsername: v.string(),
      githubAccessToken: v.string(),
      repositories: v.array(v.any()),
      publicRepos: v.optional(v.number()),
      followers: v.optional(v.number()),
      following: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    // Create or update GitHub profile in separate table
    const existingGithubProfile = await ctx.db
      .query("github_profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existingGithubProfile) {
      await ctx.db.patch(existingGithubProfile._id, {
        githubId: args.githubData.githubId,
        githubUsername: args.githubData.githubUsername,
        githubAccessToken: args.githubData.githubAccessToken,
        githubConnected: true,
        githubConnectedAt: Date.now(),
        githubLastFetch: Date.now(),
        publicRepos: args.githubData.publicRepos,
        followers: args.githubData.followers,
        following: args.githubData.following,
      });
    } else {
      await ctx.db.insert("github_profiles", {
        userId: args.userId,
        githubId: args.githubData.githubId,
        githubUsername: args.githubData.githubUsername,
        githubAccessToken: args.githubData.githubAccessToken,
        githubConnected: true,
        githubConnectedAt: Date.now(),
        githubLastFetch: Date.now(),
        publicRepos: args.githubData.publicRepos,
        followers: args.githubData.followers,
        following: args.githubData.following,
      });
    }

    // Upsert repositories
    for (const repo of args.githubData.repositories) {
      const existingRepo = await ctx.db
        .query("github_repositories")
        .withIndex("by_github_id", (q) => q.eq("githubId", repo.id))
        .first();

      if (existingRepo) {
        await ctx.db.patch(existingRepo._id, {
          name: repo.name,
          fullName: repo.full_name,
          htmlUrl: repo.html_url,
          private: repo.private,
          description: repo.description,
          language: repo.language,
          defaultBranch: repo.default_branch,
          stargazersCount: repo.stargazers_count,
          forksCount: repo.forks_count,
          lastSyncAt: Date.now(),
        });
      } else {
        await ctx.db.insert("github_repositories", {
          githubId: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          ownerId: args.userId,
          private: repo.private,
          htmlUrl: repo.html_url,
          cloneUrl: repo.clone_url,
          description: repo.description,
          language: repo.language,
          stargazersCount: repo.stargazers_count,
          forksCount: repo.forks_count,
          defaultBranch: repo.default_branch,
          isActive: true,
          lastSyncAt: Date.now(),
        });
      }
    }

    return true;
  },
});

export const getUsers = query({
  args: {
    type: v.optional(v.string()),
    country: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let users;

    if (args.type) {
      users = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("type"), args.type as any))
        .collect();
    } else {
      users = await ctx.db.query("users").collect();
    }

    // Filter and limit users
    const filteredUsers = users
      .filter((user) => !args.country || user.country === args.country)
      .slice(0, args.limit || 50);

    return filteredUsers;
  },
});

export const getUsersByType = query({
  args: {
    type: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("type"), args.type as any))
      .take(args.limit || 20);

    return users;
  },
});

export const updateKycStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      kycStatus: args.status as any,
      isVerified: args.status === "VERIFIED",
    });
    return true;
  },
});

export const completeUserProfile = mutation({
  args: {
    phoneNumber: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    type: v.union(
      v.literal("DEVELOPER"),
      v.literal("STARTUP"),
      v.literal("DESIGNER"),
      v.literal("LEAD"),
      v.literal("PROJECT_MANAGER")
    ),
    developerFields: v.optional(
      v.object({
        primaryRole: v.optional(v.array(v.string())),
      })
    ),
    startupFields: v.optional(
      v.object({
        companyName: v.optional(v.string()),
        teamSize: v.optional(v.string()),
      })
    ),
    teamLeadFields: v.optional(
      v.object({
        basicInfo: v.object({
          fullName: v.string(),
          email: v.string(),
          country: v.string(),
          phoneNumber: v.optional(v.string()),
          countryCode: v.optional(v.string()),
        }),
        profiles: v.object({
          personalWebsite: v.optional(v.string()),
          github: v.string(),
          xProfile: v.string(),
        }),
        experience: v.object({
          professionalPMExperience: v.string(),
          startupExperience: v.string(),
          resume: v.optional(v.any()),
          projectSpecialties: v.array(v.string()),
        }),
        availability: v.object({
          availabilityHours: v.string(),
          greatSoftwareDefinition: v.string(),
          projectManagementDescription: v.string(),
        }),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Get current authenticated user ID
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Update core user profile
    await ctx.db.patch(userId, {
      phoneNumber: args.phoneNumber,
      countryCode: args.countryCode,
      type: args.type,
    });

    // Create role-specific profile if needed
    if (args.type === "DEVELOPER" && args.developerFields?.primaryRole) {
      const existingProfile = await ctx.db
        .query("developer_profiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (!existingProfile) {
        await ctx.db.insert("developer_profiles", {
          userId: userId,
          primaryRole: args.developerFields.primaryRole,
        });
      }
    }

    if (args.type === "PROJECT_MANAGER" && args.developerFields?.primaryRole) {
      const existingProfile = await ctx.db
        .query("project_manager_profiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (!existingProfile) {
        await ctx.db.insert("project_manager_profiles", {
          userId: userId,
          primaryRole: args.developerFields.primaryRole,
        });
      }
    }

    if (args.type === "STARTUP" && args.startupFields?.companyName) {
      const existingProfile = await ctx.db
        .query("startup_profiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (!existingProfile) {
        await ctx.db.insert("startup_profiles", {
          userId: userId,
          companyName: args.startupFields.companyName,
          teamSize: args.startupFields.teamSize
            ? parseInt(args.startupFields.teamSize.split("-")[0])
            : undefined,
        });
      }
    }

    // Handle Team Lead profile creation
    if (args.type === "PROJECT_MANAGER" && args.teamLeadFields) {
      const existingProfile = await ctx.db
        .query("project_manager_profiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (!existingProfile) {
        await ctx.db.insert("project_manager_profiles", {
          userId: userId,
          bio: args.teamLeadFields.availability.greatSoftwareDefinition,
          experience: parseInt(args.teamLeadFields.experience.professionalPMExperience.split("-")[0]),
          experienceLevel: "SENIOR" as any, // Default to SENIOR for Team Leads
          availability: args.teamLeadFields.availability.availabilityHours,
          portfolio: args.teamLeadFields.profiles.personalWebsite ? [args.teamLeadFields.profiles.personalWebsite] : [],
          resumeUrl: args.teamLeadFields.experience.resume ? "resume_uploaded" : undefined,
          primaryRole: args.teamLeadFields.experience.projectSpecialties,
          githubProfile: args.teamLeadFields.profiles.github,
          managementExperience: parseInt(args.teamLeadFields.experience.professionalPMExperience.split("-")[0]),
          projectTypes: args.teamLeadFields.experience.projectSpecialties,
        });
      }
    }

    return { success: true };
  },
});

// Version that takes explicit userId for admin operations
export const completeUserProfileWithId = mutation({
  args: {
    userId: v.id("users"),
    phoneNumber: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    type: v.union(
      v.literal("DEVELOPER"),
      v.literal("STARTUP"),
      v.literal("DESIGNER"),
      v.literal("LEAD"),
      v.literal("PROJECT_MANAGER")
    ),
    developerFields: v.optional(
      v.object({
        primaryRole: v.optional(v.array(v.string())),
      })
    ),
    startupFields: v.optional(
      v.object({
        companyName: v.optional(v.string()),
        teamSize: v.optional(v.string()),
      })
    ),
    teamLeadFields: v.optional(
      v.object({
        basicInfo: v.object({
          fullName: v.string(),
          email: v.string(),
          country: v.string(),
          phoneNumber: v.optional(v.string()),
          countryCode: v.optional(v.string()),
        }),
        profiles: v.object({
          personalWebsite: v.optional(v.string()),
          github: v.string(),
          xProfile: v.string(),
        }),
        experience: v.object({
          professionalPMExperience: v.string(),
          startupExperience: v.string(),
          resume: v.optional(v.any()),
          projectSpecialties: v.array(v.string()),
        }),
        availability: v.object({
          availabilityHours: v.string(),
          greatSoftwareDefinition: v.string(),
          projectManagementDescription: v.string(),
        }),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Require admin privileges for this operation
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Authentication required");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser?.roleId) {
      throw new Error("Admin privileges required");
    }

    const currentRole = await ctx.db.get(currentUser.roleId);
    const isAdmin = currentRole && (
      (currentRole.permissions?.includes("admin")) ||
      currentRole.name === "admin"
    );

    if (!isAdmin) {
      throw new Error("Admin privileges required");
    }

    // Verify target user exists
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    // Update core user profile
    await ctx.db.patch(args.userId, {
      phoneNumber: args.phoneNumber,
      countryCode: args.countryCode,
      type: args.type,
    });

    // Create role-specific profile if needed
    if (args.type === "DEVELOPER" && args.developerFields?.primaryRole) {
      const existingProfile = await ctx.db
        .query("developer_profiles")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();

      if (!existingProfile) {
        await ctx.db.insert("developer_profiles", {
          userId: args.userId,
          primaryRole: args.developerFields.primaryRole,
        });
      }
    }

    if (args.type === "PROJECT_MANAGER" && args.developerFields?.primaryRole) {
      const existingProfile = await ctx.db
        .query("project_manager_profiles")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();

      if (!existingProfile) {
        await ctx.db.insert("project_manager_profiles", {
          userId: args.userId,
          primaryRole: args.developerFields.primaryRole,
        });
      }
    }

    if (args.type === "STARTUP" && args.startupFields?.companyName) {
      const existingProfile = await ctx.db
        .query("startup_profiles")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();

      if (!existingProfile) {
        await ctx.db.insert("startup_profiles", {
          userId: args.userId,
          companyName: args.startupFields.companyName,
          teamSize: args.startupFields.teamSize
            ? parseInt(args.startupFields.teamSize.split("-")[0])
            : undefined,
        });
      }
    }

    // Handle Team Lead profile creation
    if (args.type === "PROJECT_MANAGER" && args.teamLeadFields) {
      const existingProfile = await ctx.db
        .query("project_manager_profiles")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();

      if (!existingProfile) {
        await ctx.db.insert("project_manager_profiles", {
          userId: args.userId,
          bio: args.teamLeadFields.availability.greatSoftwareDefinition,
          experience: parseInt(args.teamLeadFields.experience.professionalPMExperience.split("-")[0]),
          experienceLevel: "SENIOR" as any, // Default to SENIOR for Team Leads
          availability: args.teamLeadFields.availability.availabilityHours,
          portfolio: args.teamLeadFields.profiles.personalWebsite ? [args.teamLeadFields.profiles.personalWebsite] : [],
          resumeUrl: args.teamLeadFields.experience.resume ? "resume_uploaded" : undefined,
          primaryRole: args.teamLeadFields.experience.projectSpecialties,
          githubProfile: args.teamLeadFields.profiles.github,
          managementExperience: parseInt(args.teamLeadFields.experience.professionalPMExperience.split("-")[0]),
          projectTypes: args.teamLeadFields.experience.projectSpecialties,
        });
      }
    }

    return { success: true };
  },
});

export const updateWallet = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    operation: v.union(v.literal("add"), v.literal("subtract")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    } else if (user.wallet === undefined) {
      throw new Error("User wallet not initialized");
    }

    const newAmount =
      args.operation === "add"
        ? user.wallet + args.amount
        : user.wallet - args.amount;

    if (newAmount < 0) {
      throw new Error("Insufficient wallet balance");
    }

    await ctx.db.patch(args.userId, {
      wallet: newAmount,
    });

    return newAmount;
  },
});

export const getUserGitHubRepositories = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("github_repositories")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
      .collect();
  },
});

export const getGitHubAccessToken = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const githubProfile = await ctx.db
      .query("github_profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return githubProfile?.githubAccessToken || null;
  },
});

// Admin create user mutation with password
export const create = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    password: v.string(),
    role: v.optional(
      v.union(
        v.literal("DEVELOPER"),
        v.literal("STARTUP"),
        v.literal("DESIGNER"),
        v.literal("LEAD"),
        v.literal("PROJECT_MANAGER")
      )
    ),
    isActive: v.optional(v.boolean()),
    isAdmin: v.optional(v.boolean()),
    profileData: v.optional(
      v.object({
        phoneNumber: v.optional(v.string()),
        country: v.optional(v.string()),
        industry: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Check if user with this email already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Validate password length
    if (args.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Hash the password using Scrypt
    const scrypt = new Scrypt();
    const hashedPassword = await scrypt.hash(args.password);

    // Get the appropriate role ID
    let roleId = undefined;
    if (args.isAdmin) {
      // Get admin role
      const adminRole = await ctx.db
        .query("roles")
        .withIndex("by_name", (q) => q.eq("name", "admin"))
        .first();
      
      if (adminRole) {
        roleId = adminRole._id;
      } else {
        // Create admin role if it doesn't exist
        roleId = await ctx.db.insert("roles", {
          name: "admin",
          displayName: "Administrator",
          description: "Full system administrator access",
          isActive: true,
          permissions: [
            "admin",
            "read",
            "write",
            "delete",
            "manage_users",
            "manage_roles",
            "manage_projects",
            "manage_issues",
            "manage_messages",
            "manage_transactions",
            "manage_media",
            "manage_github",
            "manage_applications",
            "view_analytics",
            "system_config"
          ],
        });
      }
    } else {
      // Get user role
      const userRole = await ctx.db
        .query("roles")
        .withIndex("by_name", (q) => q.eq("name", "user"))
        .first();
      
      if (userRole) {
        roleId = userRole._id;
      } else {
        // Create user role if it doesn't exist
        roleId = await ctx.db.insert("roles", {
          name: "user",
          displayName: "User",
          description: "Standard user with basic access",
          isActive: true,
          permissions: ["read", "write"],
        });
      }
    }

    // Create the user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      emailVerificationTime: Date.now(),
      name: args.name,
      type: args.role as any,
      roleId: roleId,
      phoneNumber: args.profileData?.phoneNumber,
      country: args.profileData?.country,
      industry: args.profileData?.industry,
      wallet: 0,
      isVerified: args.isActive ?? false,
      kycStatus: "PENDING" as any,
    });

    // Create auth account for password authentication
    await ctx.db.insert("authAccounts", {
      userId,
      provider: "password",
      providerAccountId: args.email,
      secret: hashedPassword,
    });

    return userId;
  },
});

// Admin queries
export const count = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.length;
  },
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    const offset = args.offset || 0;
    const limit = args.limit || 50;

    return users.slice(offset, offset + limit);
  },
});

// Get developers with their profiles and populated data
export const getDevelopersWithProfiles = query({
  args: {
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get all developers
    const developers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("type"), "DEVELOPER"))
      .take(args.limit || 50);

    // Populate each developer with their profile and additional data
    const developersWithProfiles = await Promise.all(
      developers.map(async (developer) => {
        // Get developer profile
        const developerProfile = await ctx.db
          .query("developer_profiles")
          .withIndex("by_user", (q) => q.eq("userId", developer._id))
          .first();

        // Get GitHub profile
        const githubProfile = await ctx.db
          .query("github_profiles")
          .withIndex("by_user", (q) => q.eq("userId", developer._id))
          .first();

        // Get user's repositories count
        const repositoriesCount = await ctx.db
          .query("github_repositories")
          .withIndex("by_owner", (q) => q.eq("ownerId", developer._id))
          .collect()
          .then((repos) => repos.length);

        // Get user's issues (projects they've worked on)
        const issuesWorkedOn = await ctx.db
          .query("issues")
          .filter((q) => q.eq(q.field("assigneeIds"), [developer._id]))
          .collect()
          .then((issues) => issues.length);

        return {
          ...developer,
          developerProfile,
          githubProfile,
          repositoriesCount,
          issuesWorkedOn,
        };
      })
    );

    // Apply search filter if provided
    if (args.search) {
      const searchTerm = args.search.toLowerCase();
      return developersWithProfiles.filter(
        (dev) =>
          dev.name?.toLowerCase().includes(searchTerm) ||
          dev.developerProfile?.skills?.some((item) =>
            item.skill.toLowerCase().includes(searchTerm)
          ) ||
          dev.country?.toLowerCase().includes(searchTerm)
      );
    }

    return developersWithProfiles;
  },
});

// Get developers with their profiles and populated data
export const getDeveloperProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get user by ID
    const user = await ctx.db.get(args.userId);
    const developerFields = await ctx.db
      .query("developer_profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return { user: user, developerFields: developerFields };
  },
});

// Get project managers with their profiles and populated data
export const getProjectManagersWithProfiles = query({
  args: {
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get all project managers
    const projectManagers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("type"), "PROJECT_MANAGER"))
      .take(args.limit || 50);

    // Populate each project manager with their profile and additional data
    const projectManagersWithProfiles = await Promise.all(
      projectManagers.map(async (projectManager) => {
        // Get project manager profile
        const projectManagerFields = await ctx.db
          .query("project_manager_profiles")
          .withIndex("by_user", (q) => q.eq("userId", projectManager._id))
          .first();

        // Get developer profile as fallback (for backwards compatibility)
        const developerFields = await ctx.db
          .query("developer_profiles")
          .withIndex("by_user", (q) => q.eq("userId", projectManager._id))
          .first();

        // Get GitHub profile
        const githubProfile = await ctx.db
          .query("github_profiles")
          .withIndex("by_user", (q) => q.eq("userId", projectManager._id))
          .first();

        // Get user's repositories count
        const repositoriesCount = await ctx.db
          .query("github_repositories")
          .withIndex("by_owner", (q) => q.eq("ownerId", projectManager._id))
          .collect()
          .then((repos) => repos.length);

        // Get projects managed by this user
        const projectsManaged = await ctx.db
          .query("projects")
          .filter((q) => q.eq(q.field("teamLeadId"), projectManager._id))
          .collect()
          .then((projects) => projects.length);

        return {
          ...projectManager,
          projectManagerFields,
          developerFields, // Keep for backwards compatibility
          githubProfile,
          repositoriesCount,
          projectsManaged,
        };
      })
    );

    // Apply search filter if provided
    if (args.search) {
      const searchTerm = args.search.toLowerCase();
      return projectManagersWithProfiles.filter(
        (pm) =>
          pm.name?.toLowerCase().includes(searchTerm) ||
          pm.projectManagerFields?.stack?.some((stackItem) =>
            stackItem.name.toLowerCase().includes(searchTerm)
          ) ||
          pm.developerFields?.skills?.some((skill) =>
            (typeof skill === "object" ? skill.skill : skill)
              .toLowerCase()
              .includes(searchTerm)
          ) ||
          pm.country?.toLowerCase().includes(searchTerm)
      );
    }

    return projectManagersWithProfiles;
  },
});

// Get project manager profile by user ID
export const getProjectManagerProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get user by ID
    const user = await ctx.db.get(args.userId);
    const projectManagerFields = await ctx.db
      .query("project_manager_profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // Get developer profile as fallback
    const developerFields = await ctx.db
      .query("developer_profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return {
      user: user,
      projectManagerFields: projectManagerFields,
      developerFields: developerFields, // Keep for backwards compatibility
    };
  },
});

// Early Bird Registration
export const registerEarlyBird = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    type: v.union(
      v.literal("developer"),
      v.literal("designer"), 
      v.literal("startup"),
      v.literal("lead"),
      v.literal("projectManager")
    ),
    phoneNumber: v.optional(v.string()),
    countryCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Input sanitization
    const sanitizedName = args.name.trim().slice(0, 100);
    const sanitizedEmail = args.email.trim().toLowerCase().slice(0, 254);
    const sanitizedPhone = args.phoneNumber?.trim().slice(0, 20);
    const sanitizedCountryCode = args.countryCode?.trim().slice(0, 10);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      throw new Error("Invalid email format");
    }

    // Name validation
    if (sanitizedName.length < 2) {
      throw new Error("Name must be at least 2 characters");
    }

    // Rate limiting: Check for recent registrations from same IP/source
    // Note: In production, you'd want to implement proper rate limiting
    const recentUsers = await ctx.db
      .query("users")
      .withIndex("by_creation_time")
      .order("desc")
      .take(10);

    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentSameEmail = recentUsers.filter(user => 
      user.email === sanitizedEmail && 
      (user.createdAt || 0) > oneHourAgo
    );

    if (recentSameEmail.length > 0) {
      throw new Error("Registration attempt too recent. Please try again later.");
    }

    // Check if user with this email already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", sanitizedEmail))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Map form types to database types
    const typeMapping = {
      developer: "DEVELOPER",
      designer: "DESIGNER", 
      startup: "STARTUP",
      lead: "LEAD",
      projectManager: "PROJECT_MANAGER"
    } as const;

    // Create new early bird user
    const userId = await ctx.db.insert("users", {
      name: sanitizedName,
      email: sanitizedEmail,
      type: typeMapping[args.type],
      phoneNumber: sanitizedPhone,
      countryCode: sanitizedCountryCode,
      earlybird: true,
      createdAt: Date.now(),
      isVerified: false,
    });

    return { userId };
  },
});
