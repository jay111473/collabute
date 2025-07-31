import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Seed admin role with all permissions
export const seedAdminRole = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if admin role already exists
    const existingAdminRole = await ctx.db
      .query("roles")
      .withIndex("by_name", (q) => q.eq("name", "admin"))
      .first();

    if (existingAdminRole) {
      console.log("Admin role already exists, updating permissions...");
      
      // Update existing admin role with all permissions
      await ctx.db.patch(existingAdminRole._id, {
        displayName: "Administrator",
        description: "Full system access and administrative privileges",
        isActive: true,
        permissions: [
          "admin",
          "read",
          "write",
          "delete",
          "manage_users",
          "manage_projects",
          "manage_issues",
          "manage_messages",
          "manage_roles",
          "manage_transactions",
          "manage_media",
          "manage_github",
          "manage_applications",
          "view_analytics",
          "system_config"
        ],
      });

      return { success: true, roleId: existingAdminRole._id, action: "updated" };
    }

    // Create new admin role
    const adminRoleId = await ctx.db.insert("roles", {
      name: "admin",
      displayName: "Administrator", 
      description: "Full system access and administrative privileges",
      isActive: true,
      permissions: [
        "admin",
        "read", 
        "write",
        "delete",
        "manage_users",
        "manage_projects", 
        "manage_issues",
        "manage_messages",
        "manage_roles",
        "manage_transactions",
        "manage_media",
        "manage_github",
        "manage_applications",
        "view_analytics",
        "system_config"
      ],
    });

    return { success: true, roleId: adminRoleId, action: "created" };
  },
});

// Seed default user roles
export const seedDefaultRoles = mutation({
  args: {},
  handler: async (ctx) => {
    const rolesToSeed = [
      {
        name: "user",
        displayName: "User",
        description: "Standard user with basic access",
        isActive: true,
        permissions: ["read", "write"]
      },
      {
        name: "developer",
        displayName: "Developer",
        description: "Developer user with project access",
        isActive: true,
        permissions: ["read", "write", "manage_projects", "manage_issues"]
      },
      {
        name: "startup",
        displayName: "Startup",
        description: "Startup user with project creation access",
        isActive: true,
        permissions: ["read", "write", "manage_projects", "manage_applications"]
      },
      {
        name: "moderator",
        displayName: "Moderator",
        description: "Content moderator with limited admin access",
        isActive: true,
        permissions: ["read", "write", "manage_messages", "manage_issues", "view_analytics"]
      }
    ];

    const results = [];

    for (const roleData of rolesToSeed) {
      const existingRole = await ctx.db
        .query("roles")
        .withIndex("by_name", (q) => q.eq("name", roleData.name))
        .first();

      if (existingRole) {
        await ctx.db.patch(existingRole._id, roleData);
        results.push({ name: roleData.name, action: "updated", id: existingRole._id });
      } else {
        const roleId = await ctx.db.insert("roles", roleData);
        results.push({ name: roleData.name, action: "created", id: roleId });
      }
    }

    return { success: true, roles: results };
  },
});

// Assign admin role to existing user by email
export const assignAdminRoleByEmail = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new Error(`User with email ${args.email} not found`);
    }

    // Ensure admin role exists
    const adminRole = await ctx.db
      .query("roles")
      .withIndex("by_name", (q) => q.eq("name", "admin"))
      .first();

    if (!adminRole) {
      throw new Error("Admin role not found. Run seedAdminRole first.");
    }

    // Assign admin role to user
    await ctx.db.patch(user._id, {
      roleId: adminRole._id,
    });

    return { 
      success: true, 
      userId: user._id, 
      userEmail: user.email,
      userName: user.name,
      roleId: adminRole._id 
    };
  },
});

// Complete database seeding (roles + assign admin)
export const seedDatabase = mutation({
  args: {
    adminEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const results = {
      adminRole: null,
      defaultRoles: null,
      adminAssignment: null,
    };

    try {
      // 1. Seed admin role
      results.adminRole = await ctx.runMutation("seed:seedAdminRole" as any, {});

      // 2. Seed default roles
      results.defaultRoles = await ctx.runMutation("seed:seedDefaultRoles" as any, {});

      // 3. Assign admin role to user if email provided
      if (args.adminEmail) {
        results.adminAssignment = await ctx.runMutation("seed:assignAdminRoleByEmail" as any, {
          email: args.adminEmail,
        });
      }

      return {
        success: true,
        message: "Database seeded successfully",
        results,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        results,
      };
    }
  },
});

// Get seeding status
export const getSeedingStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const adminRole = await ctx.db
      .query("roles")
      .withIndex("by_name", (q) => q.eq("name", "admin"))
      .first();

    const allRoles = await ctx.db.query("roles").collect();
    
    const adminUsers = adminRole 
      ? await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("roleId"), adminRole._id))
          .collect()
      : [];

    return {
      adminRoleExists: !!adminRole,
      totalRoles: allRoles.length,
      adminUsersCount: adminUsers.length,
      roles: allRoles.map(role => ({
        name: role.name,
        displayName: role.displayName,
        isActive: role.isActive,
        permissionCount: role.permissions.length,
      })),
      adminUsers: adminUsers.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name,
      })),
    };
  },
});