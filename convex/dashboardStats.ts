import { v } from "convex/values";
import { query } from "./_generated/server";

// Get issues count for a specific user (developer or PM)
export const getUserIssuesCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) return 0;

    // Get all issues assigned to this user or reported by this user
    const assignedIssues = await ctx.db
      .query("issues")
      .collect()
      .then((issues) =>
        issues.filter(
          (issue) =>
            issue.assigneeIds &&
            issue.assigneeIds.length > 0 &&
            issue.assigneeIds.includes(user._id)
        )
      );

    const reportedIssues = await ctx.db
      .query("issues")
      .withIndex("by_reporter", (q) => q.eq("reporterId", user._id))
      .collect();

    // Combine and deduplicate
    const allIssues = new Set([
      ...assignedIssues.map((i) => i._id),
      ...reportedIssues.map((i) => i._id),
    ]);

    return allIssues.size;
  },
});

// Get total payments for a developer
export const getDeveloperTotalPayments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();

    if (
      !user ||
      (user.type !== "DEVELOPER" && user.type !== "PROJECT_MANAGER")
    ) {
      return 0;
    }

    // Get developer profile
    const profile = await ctx.db
      .query("developer_profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!profile) return 0;

    // Get all transactions where this user is the recipient
    const transactions = await ctx.db
      .query("transactions")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("status"), "completed")
        )
      )
      .collect();

    // Calculate total
    const total = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    return total;
  },
});

// Get projects count for a startup or lead
export const getUserProjectsCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) return 0;

    // Get all projects owned by this user
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    return projects.length;
  },
});

// Get comprehensive dashboard stats for current user
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        issuesCount: 0,
        projectsCount: 0,
        totalPayments: 0,
        wallet: 0,
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      return {
        issuesCount: 0,
        projectsCount: 0,
        totalPayments: 0,
        wallet: 0,
      };
    }

    let stats = {
      issuesCount: 0,
      projectsCount: 0,
      totalPayments: 0,
      wallet: user.wallet || 0,
    };

    // For developers and PMs, get issues and payments
    if (user.type === "DEVELOPER" || user.type === "PROJECT_MANAGER") {
      // Get issues
      const assignedIssues = await ctx.db
        .query("issues")
        .collect()
        .then((issues) =>
          issues.filter(
            (issue) =>
              issue.assigneeIds &&
              issue.assigneeIds.length > 0 &&
              issue.assigneeIds.includes(user._id)
          )
        );

      const reportedIssues = await ctx.db
        .query("issues")
        .withIndex("by_reporter", (q) => q.eq("reporterId", user._id))
        .collect();

      const allIssues = new Set([
        ...assignedIssues.map((i) => i._id),
        ...reportedIssues.map((i) => i._id),
      ]);

      stats.issuesCount = allIssues.size;

      // Get total payments
      const transactions = await ctx.db
        .query("transactions")
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), user._id),
            q.eq(q.field("status"), "completed")
          )
        )
        .collect();

      stats.totalPayments = transactions.reduce(
        (sum, tx) => sum + (tx.amount || 0),
        0
      );
    }

    // For startups and leads, get projects
    if (user.type === "STARTUP" || user.type === "LEAD") {
      const projects = await ctx.db
        .query("projects")
        .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
        .collect();

      stats.projectsCount = projects.length;
    }

    return stats;
  },
});
