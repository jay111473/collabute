import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // Get user directly by _id (which is the auth ID)
    const user = await ctx.db.get(userId);
    if (!user) return null;

    let roleProfile = null;

    // Get role-specific profile based on user type
    switch (user.type) {
      case "DEVELOPER":
        roleProfile = await ctx.db
          .query("developer_profiles")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();
        break;

      case "LEAD":
      case "PROJECT_MANAGER":
        roleProfile = await ctx.db
          .query("lead_profiles")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();
        break;

      case "STARTUP":
        roleProfile = await ctx.db
          .query("startup_profiles")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();
        break;
    }

    // Get GitHub profile if connected
    const githubProfile = await ctx.db
      .query("github_profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return {
      ...user,
      roleProfile,
      githubProfile,
    };
  },
});

// ==============================
// USER RATING SYSTEM
// ==============================

/**
 * Get user's average rating from reviews
 */
export const getUserRating = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("user_reviews")
      .withIndex("by_reviewee", (q) => q.eq("revieweeId", args.userId))
      .filter((q) => q.eq(q.field("isVisible"), true))
      .collect();

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

    // Calculate rating breakdown
    const ratingBreakdown = reviews.reduce(
      (breakdown, review) => {
        breakdown[review.rating as keyof typeof breakdown]++;
        return breakdown;
      },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    );

    return {
      averageRating,
      totalReviews: reviews.length,
      ratingBreakdown,
    };
  },
});

/**
 * Get user reviews with reviewer information
 */
export const getUserReviews = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const reviews = await ctx.db
      .query("user_reviews")
      .withIndex("by_reviewee", (q) => q.eq("revieweeId", args.userId))
      .filter((q) => q.eq(q.field("isVisible"), true))
      .order("desc")
      .take(limit);

    // Populate reviewer information
    const reviewsWithReviewers = await Promise.all(
      reviews.map(async (review) => {
        const reviewer = await ctx.db.get(review.reviewerId);
        const project = review.projectId
          ? await ctx.db.get(review.projectId)
          : null;

        return {
          ...review,
          reviewer: reviewer
            ? {
                _id: reviewer._id,
                name: reviewer.name,
                profilePicture: reviewer.profilePicture,
              }
            : null,
          project: project
            ? {
                _id: project._id,
                title: project.title,
                slug: project.slug,
              }
            : null,
        };
      })
    );

    return reviewsWithReviewers;
  },
});

/**
 * Create a new review
 */
export const createReview = mutation({
  args: {
    revieweeId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    reviewType: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const reviewer = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();

    if (!reviewer) {
      throw new Error("Reviewer not found");
    }

    // Validate rating range
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if reviewer has already reviewed this user for this project
    if (args.projectId) {
      const existingReview = await ctx.db
        .query("user_reviews")
        .withIndex("by_reviewee", (q) => q.eq("revieweeId", args.revieweeId))
        .filter((q) =>
          q.and(
            q.eq(q.field("reviewerId"), reviewer._id),
            q.eq(q.field("projectId"), args.projectId)
          )
        )
        .first();

      if (existingReview) {
        throw new Error("You have already reviewed this user for this project");
      }
    }

    const reviewId = await ctx.db.insert("user_reviews", {
      revieweeId: args.revieweeId,
      reviewerId: reviewer._id,
      projectId: args.projectId,
      rating: args.rating,
      comment: args.comment,
      reviewType: args.reviewType,
      isVisible: true,
      createdAt: Date.now(),
    });

    return reviewId;
  },
});

// ==============================
// USER ACHIEVEMENTS SYSTEM
// ==============================

/**
 * Get user's achievements
 */
export const getUserAchievements = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const grants = await ctx.db
      .query("user_achievement_grants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isVisible"), true))
      .collect();

    // Populate achievement details
    const achievements = await Promise.all(
      grants.map(async (grant) => {
        const achievement = await ctx.db.get(grant.achievementId);
        return {
          ...grant,
          achievement,
        };
      })
    );

    return achievements.filter((item) => item.achievement?.isActive);
  },
});

/**
 * Get all available achievements
 */
export const getAvailableAchievements = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("user_achievements")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

/**
 * Grant achievement to user
 */
export const grantAchievement = mutation({
  args: {
    userId: v.id("users"),
    achievementId: v.id("user_achievements"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const granter = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();

    if (!granter) {
      throw new Error("Granter not found");
    }

    // Check if user already has this achievement
    const existingGrant = await ctx.db
      .query("user_achievement_grants")
      .withIndex("by_user_achievement", (q) =>
        q.eq("userId", args.userId).eq("achievementId", args.achievementId)
      )
      .first();

    if (existingGrant) {
      throw new Error("User already has this achievement");
    }

    const grantId = await ctx.db.insert("user_achievement_grants", {
      userId: args.userId,
      achievementId: args.achievementId,
      grantedById: granter._id,
      grantedAt: Date.now(),
      reason: args.reason,
      isVisible: true,
    });

    return grantId;
  },
});

/**
 * Create a new achievement type
 */
export const createAchievement = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    badgeColor: v.optional(v.string()),
    category: v.string(),
    criteria: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const achievementId = await ctx.db.insert("user_achievements", {
      name: args.name,
      description: args.description,
      icon: args.icon,
      badgeColor: args.badgeColor || "#fbbf24", // Default yellow
      category: args.category,
      criteria: args.criteria,
      isActive: true,
      createdAt: Date.now(),
    });

    return achievementId;
  },
});

// ==============================
// USER PROJECTS
// ==============================

/**
 * Get user's recent projects with details
 */
export const getUserProjects = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 4;

    const user = await ctx.db.get(args.userId);
    if (!user || !user.projects) {
      return [];
    }

    // Get project details
    const projects = await Promise.all(
      user.projects.map(async (projectId) => {
        const project = await ctx.db.get(projectId);
        return project;
      })
    );

    // Filter out null projects and sort by creation time (newest first)
    const validProjects = projects
      .filter(Boolean)
      .sort((a, b) => b!._creationTime - a!._creationTime)
      .slice(0, limit);

    // Enhance projects with additional data
    const enhancedProjects = await Promise.all(
      validProjects.map(async (project) => {
        if (!project) return null;

        // Get project tags/stacks for display
        const tags = project.stacks || project.tags || [];

        return {
          _id: project._id,
          title: project.title,
          description: project.description,
          tags: tags.slice(0, 3), // Limit to 3 tags for UI
          status: project.status,
          type: project.type,
          _creationTime: project._creationTime,
        };
      })
    );

    return enhancedProjects.filter(Boolean);
  },
});

// ==============================
// ENHANCED USER PROFILE DATA
// ==============================

/**
 * Get comprehensive user profile data including ratings and achievements
 */
export const getEnhancedUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get basic user data
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    // Get user rating data
    const reviews = await ctx.db
      .query("user_reviews")
      .withIndex("by_reviewee", (q) => q.eq("revieweeId", args.userId))
      .filter((q) => q.eq(q.field("isVisible"), true))
      .collect();

    const ratingData = reviews.length === 0 ? {
      averageRating: 0,
      totalReviews: 0,
      ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    } : {
      averageRating: Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10,
      totalReviews: reviews.length,
      ratingBreakdown: reviews.reduce((breakdown, review) => {
        breakdown[review.rating as keyof typeof breakdown]++;
        return breakdown;
      }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }),
    };

    // Get user achievements
    const grants = await ctx.db
      .query("user_achievement_grants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isVisible"), true))
      .collect();

    const achievements = await Promise.all(
      grants.map(async (grant) => {
        const achievement = await ctx.db.get(grant.achievementId);
        return { ...grant, achievement };
      })
    );

    // Get user's projects
    const projects = user.projects
      ? await Promise.all(
          user.projects.map(async (projectId) => {
            const project = await ctx.db.get(projectId);
            return project;
          })
        )
      : [];

    // Get profile-specific data
    const developerProfile = await ctx.db
      .query("developer_profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const leadProfile = await ctx.db
      .query("lead_profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const projectManagerProfile = await ctx.db
      .query("project_manager_profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const githubProfile = await ctx.db
      .query("github_profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return {
      ...user,
      rating: ratingData,
      achievements: achievements
        .map((grant: any) => grant.achievement)
        .filter(Boolean),
      projects: projects.filter(Boolean),
      profiles: {
        developer: developerProfile,
        lead: leadProfile,
        projectManager: projectManagerProfile,
        github: githubProfile,
      },
    };
  },
});
