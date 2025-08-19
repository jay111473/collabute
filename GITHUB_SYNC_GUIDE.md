# 🔄 GitHub Sync Implementation Guide

This guide explains how the GitHub sync system works for our platform that acts as a wrapper around GitHub repositories, issues, and collaborators.

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Environment Setup](#environment-setup)
3. [GitHub App Configuration](#github-app-configuration)
4. [Webhook Setup](#webhook-setup)
5. [Architecture Deep Dive](#architecture-deep-dive)
6. [Data Flow](#data-flow)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)
9. [Performance Considerations](#performance-considerations)

## 🔍 System Overview

Our platform is a **GitHub wrapper** that synchronizes:
- **Projects** = GitHub Repositories
- **Issues** = GitHub Issues  
- **Collaborators** = GitHub Repository Collaborators

### Core Principles:
- **Real-time sync** via webhooks for immediate updates
- **Periodic reconciliation** for data consistency
- **Bidirectional sync** (Platform ↔ GitHub)
- **Performance optimized** for Convex constraints
- **User isolation** for security

## 🚀 Environment Setup

### Required Environment Variables

Add these to your `.env.local` file:

```bash
# GitHub App Configuration
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here

# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud

# Optional: GitHub API rate limit monitoring
GITHUB_API_RATE_LIMIT_THRESHOLD=100
```

### GitHub Private Key Setup

The private key should be in PEM format with actual newlines replaced by `\n`:

```bash
# Convert newlines for environment variable
cat your-private-key.pem | tr '\n' '#' | sed 's/#/\\n/g'
```

## 🔧 GitHub App Configuration

### 1. Create GitHub App

Go to GitHub Settings > Developer settings > GitHub Apps > New GitHub App

### 2. Basic Information
- **GitHub App name**: `YourPlatform Sync`
- **Homepage URL**: `https://yourplatform.com`
- **Webhook URL**: `https://yourplatform.com/api/webhooks/github`
- **Webhook secret**: Generate a strong secret (save for env vars)

### 3. Permissions

Set these **Repository permissions**:

```yaml
Issues: Read & Write
Contents: Read
Metadata: Read
Pull requests: Read  
Repository administration: Read
```

Set these **Organization permissions**:

```yaml
Members: Read
```

### 4. Events Subscription

Subscribe to these webhook events:

```yaml
✅ Issues
✅ Repository  
✅ Member
✅ Membership
✅ Installation
✅ Installation repositories
```

### 5. Installation Settings
- **Where can this GitHub App be installed?**: Any account
- **User authorization callback URL**: `https://yourplatform.com/auth/github/callback`
- **Request user authorization (OAuth) during installation**: ✅ Checked

## 🎯 Webhook Setup

### Webhook Endpoint: `/api/webhooks/github`

Your webhook endpoint at `https://yourplatform.com/api/webhooks/github` will receive:

#### Supported Events:

1. **Repository Events**
   ```json
   {
     "action": "created|deleted|edited",
     "repository": { /* repo data */ },
     "installation": { "id": 12345 }
   }
   ```

2. **Issues Events**
   ```json
   {
     "action": "opened|closed|edited|assigned",
     "issue": { /* issue data */ },
     "repository": { /* repo data */ },
     "installation": { "id": 12345 }
   }
   ```

3. **Member Events**
   ```json
   {
     "action": "added|removed",
     "member": { /* user data */ },
     "repository": { /* repo data */ },
     "installation": { "id": 12345 }
   }
   ```

### Webhook Security

- ✅ Signature verification using HMAC SHA-256
- ✅ Timestamp validation to prevent replay attacks
- ✅ Installation ID validation

## 🏗️ Architecture Deep Dive

### Database Schema

```typescript
// Core GitHub entities
github_repositories {
  githubId: number              // GitHub repo ID
  githubInstallationId: string  // Installation ID
  name: string                  // Repository name
  fullName: string             // owner/repo
  ownerId: Id<"users">         // Platform user
  syncStatus: "synced" | "pending" | "error"
  lastSyncedAt: number
  projectId?: Id<"projects">   // Link to platform project
}

github_issues {
  githubId: number
  repositoryId: Id<"github_repositories">
  number: number               // Issue number in repo
  title: string
  state: "open" | "closed"
  platformIssueId?: Id<"issues">  // Link to platform issue
  syncStatus: "synced" | "pending" | "error"
  lastSyncedAt: number
}

github_collaborators {
  githubId: number
  repositoryId: Id<"github_repositories">
  login: string
  role: "admin" | "write" | "read"
  platformUserId?: Id<"users">  // Link to platform user
  lastSyncedAt: number
}

github_sync_operations {
  type: "webhook" | "periodic_sync" | "manual_sync"
  entityType: "repository" | "issue" | "collaborator"
  status: "success" | "failed" | "retrying"
  error?: string
  retryCount: number
  startedAt: number
  completedAt?: number
}
```

### Sync Flow Architecture

```mermaid
graph TD
    A[GitHub Event] --> B[Webhook Endpoint]
    B --> C[Signature Verification]
    C --> D[Queue Processing]
    D --> E[Background Handler]
    E --> F[Update Convex DB]
    F --> G[Real-time UI Update]
    
    H[Periodic Scheduler] --> I[Check Stale Data]
    I --> J[GitHub API Fetch]
    J --> F
    
    K[Manual Trigger] --> L[Immediate Sync]
    L --> J
```

## 🔄 Data Flow

### 1. GitHub → Platform (Webhook Flow)

```typescript
// 1. Webhook received
POST /api/webhooks/github
  ↓
// 2. Verify signature & queue
queueWebhookProcessing(event, payload)
  ↓  
// 3. Background processing
processWebhook() → handleRepositoryEvent()
                → handleIssueEvent()  
                → handleCollaboratorEvent()
  ↓
// 4. Update Convex DB
github_repositories.insert() || github_repositories.patch()
  ↓
// 5. Real-time UI update via Convex subscriptions
```

### 2. Platform → GitHub (API Flow)

```typescript
// 1. User action on platform
createIssueOnGitHub(issueId, repositoryId)
  ↓
// 2. Background API call
performIssueCreation() → GitHubSyncClient.createIssue()
  ↓
// 3. Update local records
github_issues.insert() + issues.patch()
  ↓
// 4. Real-time UI update
```

### 3. Periodic Reconciliation

```typescript
// Every 5 minutes
schedulePeriodicSync()
  ↓
// Find stale repositories
getRepositoriesNeedingSync()
  ↓
// Sync each repository
syncSingleRepository() → GitHubSyncClient.syncRepositoryData()
  ↓
// Update all entities
updateRepositories() + updateIssues() + updateCollaborators()
```

## 📚 API Reference

### Convex Mutations

#### Sync from GitHub
```typescript
// Sync specific repository
await convex.mutation(api.githubSync.syncRepositoryFromGitHub, {
  githubInstallationId: "12345",
  githubRepoId: 67890
});

// Sync all repositories for installation
await convex.mutation(api.githubSync.syncAllRepositories, {
  githubInstallationId: "12345"
});
```

#### Push to GitHub
```typescript
// Create issue on GitHub
await convex.mutation(api.githubSync.createIssueOnGitHub, {
  issueId: "issue_id",
  targetRepositoryId: "repo_id"
});

// Update issue on GitHub
await convex.mutation(api.githubSync.updateIssueOnGitHub, {
  githubIssueId: "github_issue_id",
  updates: {
    title: "New title",
    state: "closed"
  }
});
```

#### Manual Triggers
```typescript
// Trigger immediate sync
await convex.mutation(api.githubSync.triggerManualSync, {
  repositoryId: "repo_id"
});
```

### Convex Queries

#### Sync Status
```typescript
// Get repository sync status
const syncState = useQuery(api.githubSyncState.getRepositorySyncState, {
  repositoryId: "repo_id"
});

// Get user overview
const overview = useQuery(api.githubSyncState.getUserSyncOverview);

// Get scheduler health
const health = useQuery(api.githubScheduler.getSchedulerStatus);
```

### UI Components

```typescript
// Comprehensive sync status
<GitHubSyncStatus repositoryId="repo_id" />

// Compact status for lists  
<CompactSyncStatus repositoryId="repo_id" />

// Global overview dashboard
<GitHubSyncOverview />
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Webhook Not Receiving Events
```bash
# Check webhook endpoint
curl -X POST https://yourplatform.com/api/webhooks/github \
  -H "Content-Type: application/json" \
  -d '{"ping": "test"}'

# Verify webhook secret in GitHub App settings
# Check GITHUB_WEBHOOK_SECRET environment variable
```

#### 2. Authentication Errors
```bash
# Verify GitHub App credentials
echo $GITHUB_APP_ID
echo $GITHUB_PRIVATE_KEY | head -1

# Check installation permissions
# Ensure app is installed on target repositories
```

#### 3. Rate Limiting
```typescript
// Monitor rate limits
const client = new GitHubSyncClient(installationId);
const rateLimit = client.getRateLimit();
console.log("Remaining:", rateLimit.remaining);
```

#### 4. Sync Status Issues
```typescript
// Check sync operations
const operations = await convex.query(api.githubSyncState.getDetailedRepositorySync, {
  repositoryId: "repo_id"
});

// Check for failed operations
const failedOps = operations.operations.filter(op => op.status === "failed");
```

### Debug Mode

Enable debug logging:

```typescript
// In convex functions
console.log("GitHub sync debug:", {
  event,
  installationId,
  repositoryId,
  timestamp: Date.now()
});
```

## ⚡ Performance Considerations

### Convex Optimization

#### 1. Batch Operations
```typescript
// ✅ Good: Batch inserts
const batchSize = 50;
for (let i = 0; i < issues.length; i += batchSize) {
  const batch = issues.slice(i, i + batchSize);
  await Promise.all(batch.map(issue => 
    ctx.db.insert("github_issues", issue)
  ));
}

// ❌ Bad: Sequential inserts
for (const issue of issues) {
  await ctx.db.insert("github_issues", issue);
}
```

#### 2. Smart Indexing
```typescript
// Use proper indexes for queries
.withIndex("by_sync_status", ["syncStatus", "lastSyncedAt"])
.withIndex("by_github_id", ["githubId"])
.withIndex("by_repository", ["repositoryId"])
```

#### 3. Function Timeouts
- Keep functions under 10 seconds
- Use `ctx.scheduler.runAfter()` for heavy operations
- Break large operations into smaller chunks

### GitHub API Optimization

#### 1. Rate Limiting
```typescript
class GitHubSyncClient {
  async makeRequest<T>(fn: () => Promise<T>): Promise<T> {
    // Wait if rate limit low
    if (this.rateLimit.remaining < 100) {
      await this.waitForRateLimit();
    }
    
    return fn();
  }
}
```

#### 2. Intelligent Syncing
```typescript
// Only sync if changed
const lastSync = repository.lastSyncedAt;
const githubUpdated = new Date(repository.githubUpdatedAt).getTime();

if (githubUpdated > lastSync) {
  await syncRepository();
}
```

### Monitoring & Alerts

#### 1. Health Checks
```typescript
// Monitor sync health
const health = await convex.query(api.githubScheduler.getSchedulerStatus);

if (health.healthStatus === "critical") {
  // Send alert
  await sendSlackAlert("GitHub sync is critical");
}
```

#### 2. Error Tracking
```typescript
// Track failed operations
const failedOps = await convex.query(api.githubSyncState.getFailedOperations);

if (failedOps.length > 10) {
  // Investigate and fix
}
```

## 🎯 Best Practices

### Development
1. **Test webhooks locally** with ngrok or similar
2. **Use GitHub's webhook delivery page** for debugging
3. **Start with small test repositories** 
4. **Monitor Convex function execution times**

### Production
1. **Set up monitoring dashboards**
2. **Configure alerts for sync failures**
3. **Regular health checks**
4. **Backup critical sync data**

### Security
1. **Always verify webhook signatures**
2. **Validate installation ownership**
3. **Rate limit API calls**
4. **Log security events**

---

## 🚀 Quick Start Checklist

- [ ] Create GitHub App with correct permissions
- [ ] Configure webhook URL and secret
- [ ] Set environment variables
- [ ] Deploy Convex schema changes
- [ ] Test webhook with sample repository
- [ ] Verify real-time UI updates
- [ ] Monitor sync health dashboard

Your GitHub sync system is now ready for production! 🎉