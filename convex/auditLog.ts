import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Security audit log for admin operations (internal)
export const logSecurityEvent = internalMutation({
  args: {
    action: v.string(),
    targetUserId: v.optional(v.id("users")),
    details: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    const auditLogId = await ctx.db.insert("audit_logs", {
      userId: userId || undefined,
      action: args.action.slice(0, 255), // Limit action length
      targetUserId: args.targetUserId,
      details: args.details?.slice(0, 1000), // Limit details length
      ipAddress: args.ipAddress?.slice(0, 45), // IPv6 max length
      userAgent: args.userAgent?.slice(0, 500),
      timestamp: Date.now(),
    });

    return auditLogId;
  },
});

// Get audit logs (admin only)
export const getAuditLogs = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    // Check if user is admin
    const user = await ctx.db.get(userId);
    if (!user?.roleId) {
      throw new Error("Admin privileges required");
    }

    const role = await ctx.db.get(user.roleId);
    const isAdmin = role && (
      (role.permissions?.includes("admin")) ||
      role.name === "admin"
    );

    if (!isAdmin) {
      throw new Error("Admin privileges required");
    }

    // Get audit logs with pagination
    const logs = await ctx.db
      .query("audit_logs")
      .order("desc")
      .take(args.limit || 50);

    // Populate user information
    const logsWithUsers = await Promise.all(
      logs.map(async (log) => {
        let user = null;
        let targetUser = null;

        if (log.userId) {
          user = await ctx.db.get(log.userId);
        }
        if (log.targetUserId) {
          targetUser = await ctx.db.get(log.targetUserId);
        }

        return {
          ...log,
          user: user ? { _id: user._id, name: user.name, email: user.email } : null,
          targetUser: targetUser ? { _id: targetUser._id, name: targetUser.name, email: targetUser.email } : null,
        };
      })
    );

    return logsWithUsers;
  },
});
