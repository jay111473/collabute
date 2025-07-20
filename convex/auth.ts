import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user session by token
export const getUserBySessionToken = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("session")
      .withIndex("sessionToken", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (!session || session.expires < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      return null;
    }

    // Get user profile
    const profile = await ctx.db
      .query("users")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", session.userId))
      .first();

    return {
      user,
      profile,
      session,
    };
  },
});

// Create user session
export const createSession = mutation({
  args: {
    userId: v.id("user"),
    sessionToken: v.string(),
    expires: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("session", {
      userId: args.userId,
      sessionToken: args.sessionToken,
      expires: args.expires,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Delete session (logout)
export const deleteSession = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("session")
      .withIndex("sessionToken", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return true;
  },
});

// Create user account
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    emailVerified: v.optional(v.boolean()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("user")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    const userId = await ctx.db.insert("user", {
      name: args.name,
      email: args.email,
      emailVerified: args.emailVerified || false,
      image: args.image,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Link account (OAuth)
export const linkAccount = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("account", {
      userId: args.userId,
      type: args.type,
      provider: args.provider,
      providerAccountId: args.providerAccountId,
      refresh_token: args.refresh_token,
      access_token: args.access_token,
      expires_at: args.expires_at,
      token_type: args.token_type,
      scope: args.scope,
      id_token: args.id_token,
      session_state: args.session_state,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("user")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Update user
export const updateUser = mutation({
  args: {
    userId: v.id("user"),
    updates: v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerified: v.optional(v.boolean()),
      image: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
    return true;
  },
});

// Export auth component for Better Auth integration
export const betterAuthComponent = {
  getUserBySessionToken,
  createSession,
  deleteSession,
  createUser,
  linkAccount,
  getUserByEmail,
  updateUser,
};
