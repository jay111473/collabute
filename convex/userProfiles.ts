import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get current authenticated user with complete profile
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

// Get complete user profile with role-specific data
export const getCompleteUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Require authentication to view user profiles
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Authentication required");
    }

    // Users can only view their own profile unless they're admin
    if (currentUserId !== args.userId) {
      // Check if current user is admin
      const currentUser = await ctx.db.get(currentUserId);
      if (!currentUser?.roleId) {
        throw new Error("Access denied");
      }

      const currentRole = await ctx.db.get(currentUser.roleId);
      const isAdmin = currentRole && (
        (currentRole.permissions?.includes("admin")) ||
        currentRole.name === "admin"
      );

      if (!isAdmin) {
        throw new Error("Access denied - can only view your own profile");
      }
    }

    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    let roleProfile = null;

    // Get role-specific profile based on user type
    switch (user.type) {
      case "DEVELOPER":
        roleProfile = await ctx.db
          .query("developer_profiles")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .first();
        break;

      case "LEAD":
      case "PROJECT_MANAGER":
        roleProfile = await ctx.db
          .query("lead_profiles")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .first();
        break;

      case "STARTUP":
        roleProfile = await ctx.db
          .query("startup_profiles")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .first();
        break;
    }

    // Get GitHub profile if connected
    const githubProfile = await ctx.db
      .query("github_profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return {
      ...user,
      roleProfile,
      githubProfile,
    };
  },
});

// Helper function to transform skills from string array to object array
const transformSkills = (skills: string[] | undefined) => {
  if (!skills) return undefined;
  return skills.map((skill) => ({ skill, level: undefined }));
};

// Create developer profile
export const createDeveloperProfile = mutation({
  args: {
    userId: v.id("users"),
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())), // Accept string array for convenience, transform internally
    experience: v.optional(v.number()),
    experienceLevel: v.optional(
      v.union(
        v.literal("JUNIOR"),
        v.literal("MID_LEVEL"),
        v.literal("SENIOR"),
        v.literal("LEAD"),
        v.literal("ARCHITECT")
      )
    ),
    availability: v.optional(v.string()),
    preferredWorkType: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    portfolio: v.optional(v.array(v.string())),
    resumeUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, skills, ...profileData } = args;

    // Transform skills to the correct format
    const transformedSkills = transformSkills(skills);

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("developer_profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        ...profileData,
        skills: transformedSkills,
      });
      return existingProfile._id;
    }

    return await ctx.db.insert("developer_profiles", {
      userId,
      ...profileData,
      skills: transformedSkills,
    });
  },
});

// Create lead profile
export const createLeadProfile = mutation({
  args: {
    userId: v.id("users"),
    specializations: v.optional(v.array(v.string())),
    title: v.optional(v.string()),
    location: v.optional(v.string()),
    calendar: v.optional(v.array(v.any())),
    preferredPayment: v.optional(v.string()),
    companyName: v.optional(v.string()),
    companySize: v.optional(v.string()),
    managementExperience: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, ...profileData } = args;

    const existingProfile = await ctx.db
      .query("lead_profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, profileData);
      return existingProfile._id;
    }

    return await ctx.db.insert("lead_profiles", {
      userId,
      ...profileData,
    });
  },
});

// Create startup profile
export const createStartupProfile = mutation({
  args: {
    userId: v.id("users"),
    companyName: v.string(),
    companyDescription: v.optional(v.string()),
    website: v.optional(v.string()),
    fundingStage: v.optional(v.string()),
    teamSize: v.optional(v.number()),
    industry: v.optional(v.string()),
    foundedYear: v.optional(v.number()),
    businessModel: v.optional(v.string()),
    targetMarket: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...profileData } = args;

    const existingProfile = await ctx.db
      .query("startup_profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, profileData);
      return existingProfile._id;
    }

    return await ctx.db.insert("startup_profiles", {
      userId,
      ...profileData,
    });
  },
});

// Create or update GitHub profile
export const createGitHubProfile = mutation({
  args: {
    userId: v.id("users"),
    githubId: v.string(),
    githubUsername: v.string(),
    githubConnected: v.boolean(),
    githubConnectedAt: v.number(),
    githubAccessToken: v.optional(v.string()),
    githubInstallationId: v.optional(v.string()),
    publicRepos: v.optional(v.number()),
    followers: v.optional(v.number()),
    following: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, ...profileData } = args;

    const existingProfile = await ctx.db
      .query("github_profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        ...profileData,
        githubLastFetch: Date.now(),
      });
      return existingProfile._id;
    }

    return await ctx.db.insert("github_profiles", {
      userId,
      ...profileData,
      githubLastFetch: Date.now(),
    });
  },
});

// Search developers with filtering
export const searchDevelopers = query({
  args: {
    skills: v.optional(v.array(v.string())), // Keep as string array for search convenience
    experienceLevel: v.optional(
      v.union(
        v.literal("JUNIOR"),
        v.literal("MID_LEVEL"),
        v.literal("SENIOR"),
        v.literal("LEAD"),
        v.literal("ARCHITECT")
      )
    ),
    availability: v.optional(v.string()),
    minHourlyRate: v.optional(v.number()),
    maxHourlyRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all developers
    const developers = await ctx.db
      .query("users")
      .filter((q: any) => q.eq(q.field("type"), "DEVELOPER"))
      .collect();

    // Get their profiles
    const developersWithProfiles = await Promise.all(
      developers.map(async (dev) => {
        const profile = await ctx.db
          .query("developer_profiles")
          .withIndex("by_user", (q) => q.eq("userId", dev._id))
          .first();

        return {
          ...dev,
          profile,
        };
      })
    );

    // Filter based on criteria
    let filteredDevelopers = developersWithProfiles.filter(
      (dev) => dev.profile
    );

    if (args.skills?.length) {
      filteredDevelopers = filteredDevelopers.filter((dev) =>
        dev.profile?.skills?.some((skillObj) =>
          args.skills!.includes(skillObj.skill)
        )
      );
    }

    if (args.experienceLevel) {
      filteredDevelopers = filteredDevelopers.filter(
        (dev) => dev.profile?.experienceLevel === args.experienceLevel
      );
    }

    if (args.availability) {
      filteredDevelopers = filteredDevelopers.filter(
        (dev) => dev.profile?.availability === args.availability
      );
    }

    if (args.minHourlyRate) {
      filteredDevelopers = filteredDevelopers.filter(
        (dev) =>
          dev.profile?.hourlyRate &&
          dev.profile.hourlyRate >= args.minHourlyRate!
      );
    }

    if (args.maxHourlyRate) {
      filteredDevelopers = filteredDevelopers.filter(
        (dev) =>
          dev.profile?.hourlyRate &&
          dev.profile.hourlyRate <= args.maxHourlyRate!
      );
    }

    return filteredDevelopers;
  },
});

// Update user profile by type
export const updateUserProfileByType = mutation({
  args: {
    userId: v.id("users"),
    profileData: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    switch (user.type) {
      case "DEVELOPER":
        // Inline developer profile creation
        const existingDevProfile = await ctx.db
          .query("developer_profiles")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .first();

        if (existingDevProfile) {
          await ctx.db.patch(existingDevProfile._id, args.profileData as any);
          return existingDevProfile._id;
        }

        return await ctx.db.insert("developer_profiles", {
          userId: args.userId,
          ...args.profileData,
        } as any);

      case "LEAD":
      case "PROJECT_MANAGER":
        // Inline lead profile creation
        const existingLeadProfile = await ctx.db
          .query("lead_profiles")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .first();

        if (existingLeadProfile) {
          await ctx.db.patch(existingLeadProfile._id, args.profileData as any);
          return existingLeadProfile._id;
        }

        return await ctx.db.insert("lead_profiles", {
          userId: args.userId,
          ...args.profileData,
        } as any);

      case "STARTUP":
        // Inline startup profile creation
        const existingStartupProfile = await ctx.db
          .query("startup_profiles")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .first();

        if (existingStartupProfile) {
          await ctx.db.patch(
            existingStartupProfile._id,
            args.profileData as any
          );
          return existingStartupProfile._id;
        }

        return await ctx.db.insert("startup_profiles", {
          userId: args.userId,
          ...args.profileData,
        } as any);

      default:
        throw new Error("Invalid user type");
    }
  },
});
