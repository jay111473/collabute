import {
  BetterAuth,
  type AuthFunctions,
  type PublicAuthFunctions,
} from "@convex-dev/better-auth";
import { api, components, internal } from "./_generated/api";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id, DataModel } from "./_generated/dataModel";

// Typesafe way to pass Convex functions defined in this file
const authFunctions: AuthFunctions = internal.auth;
const publicAuthFunctions: PublicAuthFunctions = api.auth;

// Initialize the component
export const betterAuthComponent = new BetterAuth(components.betterAuth, {
  authFunctions,
  publicAuthFunctions,
});

// These are required named exports
export const {
  createUser,
  updateUser,
  deleteUser,
  createSession,
  isAuthenticated,
} = betterAuthComponent.createAuthFunctions<DataModel>({
  // Must create a user and return the user id
  onCreateUser: async (ctx, user) => {
    console.log("🎯 onCreateUser called with:", JSON.stringify(user, null, 2));

    // Create unified user record with both auth and business data
    const userId = await ctx.db.insert("user", {
      // BetterAuth fields
      name: user.name || "",
      email: user.email,
      emailVerified: user.emailVerified || false,
      image: user.image,
      createdAt: Date.now(),
      updatedAt: Date.now(),

      // Business fields
      profilePicture: user.image,
      type: "DEVELOPER",
      kycStatus: "PENDING",
      isVerified: false,
      earlybird: false,
      wallet: 0,
    });

    console.log("✅ User created with ID:", userId);
    return userId;
  },


  // Delete the user when they are deleted from Better Auth
  onDeleteUser: async (ctx, userId) => {
    console.log("🗑️ onDeleteUser called for:", userId);

    // Also clean up GitHub profile
    const githubProfile = await ctx.db
      .query("github_profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId as Id<"user">))
      .first();

    if (githubProfile) {
      await ctx.db.delete(githubProfile._id);
    }

    await ctx.db.delete(userId as Id<"user">);
  },
});

// This function is no longer needed since we have a unified user table
// Keeping it for backward compatibility, but it will be a no-op

// Get the current authenticated user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Get user data from Better Auth with all fields merged
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    console.log("BetterAuth userMetadata:", userMetadata);

    if (!userMetadata) {
      console.log("No userMetadata from BetterAuth");
      return null;
    }

    console.log("Looking for user with ID:", userMetadata.userId);

    // Since we now have a unified table, userMetadata contains everything
    // Just return the user data directly from the unified table
    const user = await ctx.db.get(userMetadata.userId as Id<"user">);
    console.log("Found user in Convex:", user);

    if (!user) {
      // Try to find user by email as fallback
      const userByEmail = await ctx.db
        .query("user")
        .withIndex("email", (q) => q.eq("email", userMetadata.email))
        .first();
      console.log("User found by email fallback:", userByEmail);
      return userByEmail;
    }

    return user;
  },
});

// Debug function to list all users
export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("user").collect();
    console.log("All users in database:", users);
    return users;
  },
});

// Debug function to list all accounts
export const listAllAccounts = query({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("account").collect();
    console.log("All accounts in database:", accounts);
    return accounts;
  },
});

// Debug function to list all sessions
export const listAllSessions = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db.query("session").collect();
    console.log("All sessions in database:", sessions);
    return sessions;
  },
});

// Migration function to create missing user from session data
export const createMissingUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
    emailVerified: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists by email
    const existingUser = await ctx.db
      .query("user")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      console.log("User already exists:", existingUser);

      // Check if GitHub profile exists, create it if missing
      const existingGithubProfile = await ctx.db
        .query("github_profiles")
        .withIndex("by_user", (q) => q.eq("userId", existingUser._id))
        .first();

      if (!existingGithubProfile) {
        // Try to find GitHub account data
        const githubAccount = await ctx.db
          .query("account")
          .withIndex("userId", (q) => q.eq("userId", existingUser._id))
          .filter((q) => q.eq(q.field("provider"), "github"))
          .first();

        if (githubAccount) {
          console.log("Creating missing GitHub profile for existing user");
          await ctx.db.insert("github_profiles", {
            userId: existingUser._id,
            githubId: githubAccount.providerAccountId,
            githubUsername: githubAccount.providerAccountId,
            githubConnected: true,
            githubConnectedAt: Date.now(),
            githubAccessToken: githubAccount.access_token,
            githubInstallationId: githubAccount.providerAccountId,
            githubLastFetch: Date.now(),
            publicRepos: 0,
            followers: 0,
            following: 0,
          });
        }
      }

      return existingUser;
    }

    // Create the user record that should have been created during login
    const userId = await ctx.db.insert("user", {
      name: args.name || "",
      email: args.email,
      emailVerified: args.emailVerified || false,
      image: args.image,
      createdAt: args.createdAt || Date.now(),
      updatedAt: args.updatedAt || Date.now(),

      // Business fields with defaults
      profilePicture: args.image,
      type: "DEVELOPER",
      kycStatus: "PENDING",
      isVerified: false,
      earlybird: false,
      wallet: 0,
    });

    console.log("Created missing user:", userId);
    return await ctx.db.get(userId);
  },
});

// Get GitHub profile for a user
export const getGithubProfile = query({
  args: { userId: v.id("user") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("github_profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

// Debug function to check user accounts
export const debugUserAccounts = query({
  args: { userId: v.id("user") },
  handler: async (ctx, { userId }) => {
    console.log("Debugging accounts for user:", userId);

    // Get all accounts for this user
    const allAccounts = await ctx.db
      .query("account")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    console.log("All accounts for user:", allAccounts);

    // Get user data
    const user = await ctx.db.get(userId);
    console.log("User data:", user);

    // Check if GitHub profile exists
    const githubProfile = await ctx.db
      .query("github_profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    console.log("Existing GitHub profile:", githubProfile);

    return {
      user,
      accounts: allAccounts,
      githubProfile,
    };
  },
});

// Create GitHub profile for user (called after GitHub OAuth account is created)
export const createGithubProfileForUser = mutation({
  args: { userId: v.id("user") },
  handler: async (ctx, { userId }) => {
    console.log("Creating GitHub profile for user:", userId);

    // Check if GitHub profile already exists
    const existingProfile = await ctx.db
      .query("github_profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      console.log("GitHub profile already exists");
      return existingProfile;
    }

    // Debug: Get all accounts for this user first
    const allAccounts = await ctx.db
      .query("account")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    console.log("All accounts found for user:", allAccounts);

    // Find the GitHub account
    const githubAccount = await ctx.db
      .query("account")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("provider"), "github"))
      .first();

    console.log("GitHub account found:", githubAccount);

    if (!githubAccount) {
      console.log(
        "No GitHub account found for user. Available providers:",
        allAccounts.map((acc) => acc.provider)
      );
      throw new Error("GitHub account not found for user");
    }

    // Create the GitHub profile
    const profileId = await ctx.db.insert("github_profiles", {
      userId,
      githubId: githubAccount.providerAccountId,
      githubUsername: githubAccount.providerAccountId, // Will be updated with actual username
      githubConnected: true,
      githubConnectedAt: Date.now(),
      githubAccessToken: githubAccount.access_token,
      githubInstallationId: githubAccount.providerAccountId,
      githubLastFetch: Date.now(),
      publicRepos: 0,
      followers: 0,
      following: 0,
    });

    console.log("GitHub profile created successfully:", profileId);
    return await ctx.db.get(profileId);
  },
});

// Update GitHub profile with fetched data
export const updateGithubProfile = mutation({
  args: {
    userId: v.id("user"),
    githubUsername: v.optional(v.string()),
    publicRepos: v.optional(v.number()),
    followers: v.optional(v.number()),
    following: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("github_profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) {
      throw new Error("GitHub profile not found");
    }

    await ctx.db.patch(profile._id, {
      githubUsername: args.githubUsername || profile.githubUsername,
      publicRepos: args.publicRepos ?? profile.publicRepos,
      followers: args.followers ?? profile.followers,
      following: args.following ?? profile.following,
      githubLastFetch: Date.now(),
    });

    return await ctx.db.get(profile._id);
  },
});
