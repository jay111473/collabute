import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, GitHub],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      // If the user signed in with GitHub, store their GitHub profile data
      if (args.type === "oauth" && args.provider?.id === "github") {
        try {
          // Check if GitHub profile already exists
          const existingGithubProfile = await ctx.db
            .query("github_profiles")
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .first();

          // Extract and sanitize data from the profile
          const profile = args.profile || {};
          const githubId = String(
            profile.id || profile.sub || Date.now()
          ).slice(0, 50); // Limit length
          const githubUsername = String(
            profile.login ||
              profile.nickname ||
              profile.preferred_username ||
              profile.username ||
              profile.email?.split("@")[0] ||
              `user_${githubId}`
          ).slice(0, 39); // GitHub username max length

          if (existingGithubProfile) {
            // Update existing profile
            await ctx.db.patch(existingGithubProfile._id, {
              githubId,
              githubUsername,
              githubConnected: true,
              githubConnectedAt: Date.now(),
              githubLastFetch: Date.now(),
            });
          } else {
            // Create new GitHub profile
            await ctx.db.insert("github_profiles", {
              userId: args.userId,
              githubId,
              githubUsername,
              githubConnected: true,
              githubConnectedAt: Date.now(),
              githubLastFetch: Date.now(),
              publicRepos: 0,
              followers: 0,
              following: 0,
            });
          }

          // Update user profile with GitHub data if available
          if (profile.name || profile.image) {
            const user = await ctx.db.get(args.userId);
            if (user && "name" in user) {
              const updates: any = {};

              // Sanitize and update name if not set
              if (
                !user.name &&
                profile.name &&
                typeof profile.name === "string"
              ) {
                updates.name = profile.name.slice(0, 100); // Limit name length
              }

              // Sanitize and update profile picture if available
              if (
                profile.image &&
                typeof profile.image === "string" &&
                "image" in user
              ) {
                // Validate image URL format
                if (profile.image.startsWith("https://")) {
                  updates.image = profile.image.slice(0, 500); // Limit URL length
                }
              }

              if (Object.keys(updates).length > 0) {
                await ctx.db.patch(args.userId, updates);
              }
            }
          }
        } catch (error) {
          // Silently handle errors to prevent information leakage
          // In production, you might want to log to a secure logging service
        }
      }
    },
  },
});
