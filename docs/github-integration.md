# GitHub OAuth Integration & Data Storage Guide

This guide explains how to implement GitHub OAuth authentication with automatic data storage for user repositories and activities in your Convex + BetterAuth application.

## Overview

Our GitHub integration automatically:
- Stores GitHub profile data during OAuth login
- Captures access tokens for future API calls
- Provides functions to fetch repositories and activities
- Maintains data synchronization between GitHub and your database

## Architecture

```
GitHub OAuth → BetterAuth → Convex Database
                ↓
          User + GitHub Profile
                ↓
          Repository & Activity Data
```

## Implementation Steps

### 1. Database Schema Setup

First, ensure your schema includes the required tables in `convex/schema.ts`:

```typescript
// Unified user table (includes BetterAuth + business fields)
user: defineTable({
  // BetterAuth fields
  name: v.string(),
  email: v.string(),
  emailVerified: v.boolean(),
  image: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),

  // Business fields
  profilePicture: v.optional(v.string()),
  type: UserType,
  // ... other business fields
})
.index("email", ["email"]),

// GitHub integration data
github_profiles: defineTable({
  userId: v.id("user"),
  githubId: v.string(),
  githubUsername: v.string(),
  githubConnected: v.boolean(),
  githubConnectedAt: v.number(),
  githubAccessToken: v.optional(v.string()),
  githubInstallationId: v.optional(v.string()),
  githubLastFetch: v.optional(v.number()),
  publicRepos: v.optional(v.number()),
  followers: v.optional(v.number()),
  following: v.optional(v.number()),
})
.index("by_user", ["userId"])
.index("by_github_id", ["githubId"]),

// Repository storage
github_repositories: defineTable({
  githubId: v.number(),
  name: v.string(),
  fullName: v.string(),
  description: v.optional(v.string()),
  ownerId: v.id("user"),
  private: v.boolean(),
  htmlUrl: v.string(),
  cloneUrl: v.string(),
  language: v.optional(v.string()),
  stargazersCount: v.number(),
  forksCount: v.number(),
  defaultBranch: v.string(),
  isActive: v.boolean(),
  lastSyncAt: v.number(),
  projectId: v.optional(v.id("projects")),
})
.index("by_github_id", ["githubId"])
.index("by_owner", ["ownerId"]),
```

### 2. Authentication Setup (`convex/auth.ts`)

Configure the BetterAuth integration to automatically store GitHub data:

```typescript
export const {
  createUser,
  updateUser,
  deleteUser,
  createSession,
  isAuthenticated,
} = betterAuthComponent.createAuthFunctions<DataModel>({
  onCreateUser: async (ctx, user) => {
    // Create unified user record
    const userId = await ctx.db.insert("user", {
      name: user.name || "",
      email: user.email,
      emailVerified: user.emailVerified || false,
      image: user.image,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      
      // Business fields with defaults
      profilePicture: user.image,
      type: "DEVELOPER",
      kycStatus: "PENDING",
      isVerified: false,
      earlybird: false,
      wallet: 0,
    });

    // Note: GitHub account data will be available separately in the 'account' table
    // The GitHub profile creation will be handled by the createGithubProfileForUser mutation
    console.log("User created, GitHub profile will be created separately if needed");

    return userId;
  },

  onDeleteUser: async (ctx, userId) => {
    // Clean up GitHub profile when user is deleted
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

// Create GitHub profile for user (called after GitHub OAuth account is created)
export const createGithubProfileForUser = mutation({
  args: { userId: v.id("user") },
  handler: async (ctx, { userId }) => {
    // Check if GitHub profile already exists
    const existingProfile = await ctx.db
      .query("github_profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      return existingProfile;
    }

    // Find the GitHub account
    const githubAccount = await ctx.db
      .query("account")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("provider"), "github"))
      .first();

    if (!githubAccount) {
      throw new Error("GitHub account not found for user");
    }

    // Create the GitHub profile
    const profileId = await ctx.db.insert("github_profiles", {
      userId,
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

    return await ctx.db.get(profileId);
  },
});
```

### 3. GitHub Data Fetching (`convex/github.ts`)

Create actions to fetch and store GitHub data:

```typescript
// Fetch and store user repositories
export const fetchAndStoreRepositories = action({
  args: { userId: v.id("user") },
  handler: async (ctx, { userId }) => {
    const githubProfile = await ctx.runQuery("auth:getGithubProfile" as any, { userId });
    
    if (!githubProfile?.githubAccessToken) {
      throw new Error("GitHub access token not found");
    }

    const response = await fetch("https://api.github.com/user/repos?per_page=100", {
      headers: {
        Authorization: `Bearer ${githubProfile.githubAccessToken}`,
        "User-Agent": "YourApp-Name",
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos = await response.json();
    
    // Store repositories
    const repoData = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || "",
      private: repo.private,
      htmlUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      language: repo.language || "",
      stargazersCount: repo.stargazers_count,
      forksCount: repo.forks_count,
      defaultBranch: repo.default_branch,
    }));

    const syncedRepoIds = await ctx.runMutation("github:syncUserRepositories" as any, {
      userId,
      repositories: repoData,
    });

    return { syncedCount: syncedRepoIds.length, repositories: repoData };
  },
});

// Fetch user activities
export const fetchGithubActivities = action({
  args: { userId: v.id("user") },
  handler: async (ctx, { userId }) => {
    const githubProfile = await ctx.runQuery("auth:getGithubProfile" as any, { userId });
    
    if (!githubProfile?.githubAccessToken || !githubProfile.githubUsername) {
      throw new Error("GitHub profile incomplete");
    }

    const response = await fetch(
      `https://api.github.com/users/${githubProfile.githubUsername}/events?per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${githubProfile.githubAccessToken}`,
          "User-Agent": "YourApp-Name",
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const activities = await response.json();
    
    // Filter relevant activities
    const relevantActivities = activities.filter((activity: any) => 
      ['PushEvent', 'PullRequestEvent', 'IssuesEvent', 'CreateEvent', 'ForkEvent']
        .includes(activity.type)
    );

    return relevantActivities;
  },
});
```

### 4. Frontend Integration

Use the GitHub integration in your React components:

```typescript
// hooks/use-github.ts
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useGithubIntegration(userId: string) {
  const fetchRepositories = useAction(api.github.fetchAndStoreRepositories);
  const fetchActivities = useAction(api.github.fetchGithubActivities);
  const repositories = useQuery(api.github.getUserRepositories, { userId });
  const githubProfile = useQuery(api.auth.getGithubProfile, { userId });

  const syncRepositories = async () => {
    try {
      const result = await fetchRepositories({ userId });
      console.log(`Synced ${result.syncedCount} repositories`);
      return result;
    } catch (error) {
      console.error("Failed to sync repositories:", error);
      throw error;
    }
  };

  const getActivities = async () => {
    try {
      const activities = await fetchActivities({ userId });
      return activities;
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      throw error;
    }
  };

  return {
    githubProfile,
    repositories,
    syncRepositories,
    getActivities,
    isConnected: !!githubProfile?.githubConnected,
  };
}
```

```tsx
// components/github-dashboard.tsx
import { useGithubIntegration } from "@/hooks/use-github";
import { useUserConvex } from "@/hooks/use-user-convex";

export function GitHubDashboard() {
  const { user } = useUserConvex();
  const { 
    githubProfile, 
    repositories, 
    syncRepositories, 
    getActivities, 
    isConnected 
  } = useGithubIntegration(user?._id);

  const handleSync = async () => {
    if (!user?._id) return;
    
    try {
      await syncRepositories();
      const activities = await getActivities();
      console.log("Activities:", activities);
    } catch (error) {
      console.error("Sync failed:", error);
    }
  };

  if (!isConnected) {
    return <div>GitHub not connected</div>;
  }

  return (
    <div>
      <h2>GitHub Integration</h2>
      <p>Connected as: {githubProfile?.githubUsername}</p>
      <p>Public repositories: {githubProfile?.publicRepos}</p>
      
      <button onClick={handleSync}>
        Sync GitHub Data
      </button>
      
      <div>
        <h3>Repositories ({repositories?.length || 0})</h3>
        {repositories?.map(repo => (
          <div key={repo._id}>
            <h4>{repo.name}</h4>
            <p>{repo.description}</p>
            <p>⭐ {repo.stargazersCount} | 🍴 {repo.forksCount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Important Note About Automatic GitHub Profile Creation

The GitHub profile creation happens automatically through the `useUserConvex` hook:

```typescript
// In useUserConvex hook
const createGithubProfile = useMutation(api.auth.createGithubProfileForUser);

// Create GitHub profile if user exists but no GitHub profile
useEffect(() => {
  if (currentUser?._id && !sessionLoading) {
    // Try to create GitHub profile (it will check if one already exists)
    createGithubProfile({ userId: currentUser._id }).catch((error) => {
      // Ignore error if no GitHub account exists
      if (!error.message.includes("GitHub account not found")) {
        console.error("Error creating GitHub profile:", error);
      }
    });
  }
}, [currentUser, sessionLoading, createGithubProfile]);
```

## Best Practices

### 1. Error Handling

Always implement proper error handling for GitHub API calls:

```typescript
try {
  const result = await fetchRepositories({ userId });
} catch (error) {
  if (error.message.includes('403')) {
    // Rate limit exceeded
    console.log("Rate limit exceeded, try again later");
  } else if (error.message.includes('401')) {
    // Invalid token
    console.log("GitHub token expired, re-authenticate");
  } else {
    console.error("Unexpected error:", error);
  }
}
```

### 2. Rate Limiting

Respect GitHub's API rate limits:
- 5,000 requests per hour for authenticated requests
- Use conditional requests when possible
- Cache data locally to minimize API calls

### 3. Data Freshness

Implement smart data synchronization:

```typescript
// Only sync if data is stale (older than 1 hour)
const shouldSync = !githubProfile?.githubLastFetch || 
  (Date.now() - githubProfile.githubLastFetch > 3600000);

if (shouldSync) {
  await syncRepositories();
}
```

### 4. Security

- Store access tokens securely in the database
- Never expose tokens in client-side code
- Validate all GitHub API responses
- Sanitize repository descriptions and names

### 5. Performance

- Use Convex's reactive queries for real-time updates
- Implement pagination for large repository lists
- Cache frequently accessed data

## Migration Guide

If you have existing users without GitHub profiles:

```typescript
// Migration function
export const migrateExistingUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("user").collect();
    
    for (const user of users) {
      const githubAccount = await ctx.db
        .query("account")
        .withIndex("userId", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("provider"), "github"))
        .first();
        
      if (githubAccount) {
        const existingProfile = await ctx.db
          .query("github_profiles")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();
          
        if (!existingProfile) {
          await ctx.db.insert("github_profiles", {
            userId: user._id,
            githubId: githubAccount.providerAccountId,
            githubUsername: githubAccount.providerAccountId,
            githubConnected: true,
            githubConnectedAt: Date.now(),
            githubAccessToken: githubAccount.access_token,
            // ... other fields
          });
        }
      }
    }
  },
});
```

## Troubleshooting

### Common Issues

1. **No GitHub profile created during login**
   - Check that `onCreateUser` is being called
   - Verify account data is available in the callback
   - Check console logs for errors

2. **API requests failing**
   - Verify access token is stored correctly
   - Check GitHub API rate limits
   - Ensure proper headers are set

3. **Data not syncing**
   - Check network connectivity
   - Verify Convex functions are deployed
   - Look for TypeScript errors in the console

### Debug Commands

```typescript
// Check if user has GitHub profile
const profile = await ctx.runQuery(api.auth.getGithubProfile, { userId });

// List all GitHub accounts
const accounts = await ctx.db
  .query("account")
  .filter((q) => q.eq(q.field("provider"), "github"))
  .collect();

// Test GitHub API connection
const response = await fetch("https://api.github.com/user", {
  headers: { Authorization: `Bearer ${accessToken}` }
});
```

## Conclusion

This GitHub integration provides a complete solution for:
- Automatic profile creation during OAuth
- Secure token storage
- Repository and activity synchronization
- Real-time data access through Convex

The system is designed to be scalable, secure, and maintainable while providing a smooth user experience.