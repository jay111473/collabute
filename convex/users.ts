import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// This function is deprecated since user creation is now handled in auth.ts
// Keeping for backward compatibility but redirecting to user table
export const createUserProfile = mutation({
  args: {
    authUserId: v.id("user"),
    profilePicture: v.optional(v.string()),
    type: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    country: v.optional(v.string()),
    industry: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Since we have a unified user table, just update the existing user
    const user = await ctx.db.get(args.authUserId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update the user with additional profile data
    await ctx.db.patch(args.authUserId, {
      profilePicture: args.profilePicture || user.profilePicture,
      type: (args.type as any) || user.type,
      phoneNumber: args.phoneNumber || user.phoneNumber,
      countryCode: args.countryCode || user.countryCode,
      country: args.country || user.country,
      industry: args.industry || user.industry,
    });

    return args.authUserId;
  },
});

export const getUserProfile = query({
  args: { authUserId: v.id("user") },
  handler: async (ctx, args) => {
    // With unified table, just return the user directly
    return await ctx.db.get(args.authUserId);
  },
});

export const updateUserProfile = mutation({
  args: {
    userId: v.id("user"),
    updates: v.object({
      profilePicture: v.optional(v.string()),
      type: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
      countryCode: v.optional(v.string()),
      country: v.optional(v.string()),
      industry: v.optional(v.string()),
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
    userId: v.id("user"),
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
        .query("user")
        .withIndex("by_type", (q) => q.eq("type", args.type as any))
        .collect();
    } else {
      users = await ctx.db.query("user").collect();
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
      .query("user")
      .withIndex("by_type", (q) => q.eq("type", args.type as any))
      .take(args.limit || 20);

    return users;
  },
});

export const updateKycStatus = mutation({
  args: {
    userId: v.id("user"),
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
  },
  handler: async (ctx, args) => {
    // Get current user from Better Auth
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // The user ID from Better Auth is the unified user table ID
    const userId = identity.subject as any;

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
          skills: args.developerFields.primaryRole,
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

    return { success: true };
  },
});

// Version that takes explicit userId for admin operations
export const completeUserProfileWithId = mutation({
  args: {
    userId: v.id("user"),
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
  },
  handler: async (ctx, args) => {
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
          skills: args.developerFields.primaryRole,
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

    return { success: true };
  },
});

export const updateWallet = mutation({
  args: {
    userId: v.id("user"),
    amount: v.number(),
    operation: v.union(v.literal("add"), v.literal("subtract")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
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
  args: { userId: v.id("user") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("github_repositories")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
      .collect();
  },
});
