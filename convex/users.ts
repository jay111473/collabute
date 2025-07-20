import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    // Check if user profile already exists
    const existingProfile = await ctx.db
      .query("users")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", args.authUserId))
      .first();

    if (existingProfile) {
      return existingProfile._id;
    }

    const userId = await ctx.db.insert("users", {
      authUserId: args.authUserId,
      profilePicture: args.profilePicture,
      type: (args.type as any) || "DEVELOPER",
      phoneNumber: args.phoneNumber,
      countryCode: args.countryCode,
      country: args.country,
      industry: args.industry,
      isVerified: false,
      kycStatus: "PENDING",
      earlybird: false,
      wallet: 0,
    });

    return userId;
  },
});

export const getUserProfile = query({
  args: { authUserId: v.id("user") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("users")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", args.authUserId))
      .first();

    if (!profile) {
      return null;
    }

    // Get the auth user data
    const authUser = await ctx.db.get(args.authUserId);

    return {
      ...profile,
      email: authUser?.email,
      name: authUser?.name,
    };
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
    }),
  },
  handler: async (ctx, args) => {
    // Only update fields that exist in the core users table
    const coreUpdates = {
      profilePicture: args.updates.profilePicture,
      type: args.updates.type,
      phoneNumber: args.updates.phoneNumber,
      countryCode: args.updates.countryCode,
      country: args.updates.country,
      industry: args.updates.industry,
    };

    // Remove undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(coreUpdates).filter(([_, v]) => v !== undefined)
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
        .withIndex("by_type", (q) => q.eq("type", args.type as any))
        .collect();
    } else {
      users = await ctx.db.query("users").collect();
    }

    // Get auth user data for each user
    const usersWithAuthData = await Promise.all(
      users
        .filter((user) => !args.country || user.country === args.country)
        .slice(0, args.limit || 50)
        .map(async (user) => {
          const authUser = await ctx.db.get(user.authUserId);
          return {
            ...user,
            email: authUser?.email,
            name: authUser?.name,
          };
        })
    );

    return usersWithAuthData;
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
      .withIndex("by_type", (q) => q.eq("type", args.type as any))
      .take(args.limit || 20);

    // Get auth user data for each user
    const usersWithAuthData = await Promise.all(
      users.map(async (user) => {
        const authUser = await ctx.db.get(user.authUserId);
        return {
          ...user,
          email: authUser?.email,
          name: authUser?.name,
        };
      })
    );

    return usersWithAuthData;
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
