import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

// Store GitHub installation ID for the authenticated user
export const storeInstallationId = mutation({
  args: {
    installationId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    try {
      // Check if GitHub profile already exists for this user
      const existingProfile = await ctx.db
        .query("github_profiles")
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();

      if (existingProfile) {
        // Update existing profile with installation ID
        await ctx.db.patch(existingProfile._id, {
          githubInstallationId: args.installationId,
          githubConnected: true,
          githubConnectedAt: existingProfile.githubConnectedAt || Date.now(),
        });
        return { success: true, profileId: existingProfile._id };
      } else {
        // Create new profile with installation ID
        const profileId = await ctx.db.insert("github_profiles", {
          userId,
          githubId: "", // Will be filled when we get GitHub user data
          githubUsername: "", // Will be filled when we get GitHub user data
          githubConnected: true,
          githubConnectedAt: Date.now(),
          githubInstallationId: args.installationId,
          githubLastFetch: Date.now(),
          publicRepos: 0,
          followers: 0,
          following: 0,
        });
        return { success: true, profileId };
      }
    } catch (error) {
      throw new Error("Failed to store GitHub installation ID");
    }
  },
});