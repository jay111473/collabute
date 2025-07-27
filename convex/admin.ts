import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Check if user has admin role
export const isUserAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const user = await ctx.db.get(userId);
    if (!user || !user.roleId) {
      return false;
    }

    const role = await ctx.db.get(user.roleId);
    if (!role) {
      return false;
    }

    // Check if role has admin permissions
    return (role.permissions && Array.isArray(role.permissions) && role.permissions.includes("admin")) || role.name === "admin";
  },
});

// Get current user's admin status with role details
export const getAdminStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { isAdmin: false, user: null, role: null };
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return { isAdmin: false, user: null, role: null };
    }

    let role = null;
    let isAdmin = false;

    if (user.roleId) {
      role = await ctx.db.get(user.roleId);
      if (role) {
        isAdmin = (role.permissions && Array.isArray(role.permissions) && role.permissions.includes("admin")) || role.name === "admin";
      }
    }

    return {
      isAdmin,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      role: role ? {
        id: role._id,
        name: role.name,
        displayName: role.displayName,
        permissions: role.permissions || [],
      } : null,
    };
  },
});

// Create or ensure admin role exists (deprecated - use seed script instead)
export const ensureAdminRole = mutation({
  args: {},
  handler: async (ctx) => {
    console.warn("ensureAdminRole is deprecated. Use the seed script: bun run seed:admin");
    
    // Check if admin role already exists
    const existingAdminRole = await ctx.db
      .query("roles")
      .withIndex("by_name", (q) => q.eq("name", "admin"))
      .first();

    if (existingAdminRole) {
      return existingAdminRole._id;
    }

    // Create basic admin role (use seed script for full permissions)
    const adminRoleId = await ctx.db.insert("roles", {
      name: "admin",
      displayName: "Administrator",
      description: "Full system access and administrative privileges",
      isActive: true,
      permissions: ["admin", "read", "write", "delete", "manage_users", "manage_projects"],
    });

    return adminRoleId;
  },
});

// Assign admin role to user (protected mutation)
export const assignAdminRole = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Only existing admins can assign admin role
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    // Check if current user is admin
    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || !currentUser.roleId) {
      throw new Error("Not authorized - no role assigned");
    }

    const currentRole = await ctx.db.get(currentUser.roleId);
    const hasAdminPermission = currentRole && (
      (currentRole.permissions && Array.isArray(currentRole.permissions) && currentRole.permissions.includes("admin")) || 
      currentRole.name === "admin"
    );
    if (!hasAdminPermission) {
      throw new Error("Not authorized - admin privileges required");
    }

    // Ensure admin role exists
    const adminRoleId = await ensureAdminRole(ctx, {});

    // Assign admin role to target user
    await ctx.db.patch(args.userId, {
      roleId: adminRoleId,
    });

    return { success: true };
  },
});

// Create first admin user (only works if no admin exists)
export const createFirstAdmin = mutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if any admin already exists
    const adminRole = await ctx.db
      .query("roles")
      .withIndex("by_name", (q) => q.eq("name", "admin"))
      .first();

    if (adminRole) {
      const existingAdmins = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("roleId"), adminRole._id))
        .collect();

      if (existingAdmins.length > 0) {
        throw new Error("Admin user already exists");
      }
    }

    // Find user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Ensure admin role exists
    const adminRoleId = await ensureAdminRole(ctx, {});

    // Assign admin role
    await ctx.db.patch(user._id, {
      roleId: adminRoleId,
      name: args.name,
    });

    return { success: true, userId: user._id };
  },
});