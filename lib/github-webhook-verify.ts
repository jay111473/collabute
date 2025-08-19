import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verifies GitHub webhook signature
 * @param payload - Raw request body as string
 * @param signature - x-hub-signature-256 header value
 * @returns boolean indicating if signature is valid
 */
export function verifyGitHubWebhook(payload: string, signature: string | null): boolean {
  if (!signature) {
    return false;
  }

  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    console.error('GITHUB_WEBHOOK_SECRET not configured');
    return false;
  }

  // Remove 'sha256=' prefix from signature
  const sig = signature.replace('sha256=', '');
  
  // Create expected signature
  const hmac = createHmac('sha256', secret);
  hmac.update(payload, 'utf8');
  const expectedSignature = hmac.digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  try {
    const sigBuffer = Buffer.from(sig, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    
    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }
    
    return timingSafeEqual(sigBuffer, expectedBuffer);
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Extract installation ID from GitHub webhook payload
 */
export function extractInstallationId(payload: any): string | null {
  // Different event types have installation ID in different places
  if (payload.installation?.id) {
    return payload.installation.id.toString();
  }
  
  // Some events have it nested differently
  if (payload.repository?.owner?.installation?.id) {
    return payload.repository.owner.installation.id.toString();
  }
  
  return null;
}

/**
 * Extract repository information from webhook payload
 */
export function extractRepositoryInfo(payload: any) {
  if (!payload.repository) {
    return null;
  }

  return {
    githubId: payload.repository.id,
    name: payload.repository.name,
    fullName: payload.repository.full_name,
    description: payload.repository.description,
    private: payload.repository.private,
    htmlUrl: payload.repository.html_url,
    cloneUrl: payload.repository.clone_url,
    defaultBranch: payload.repository.default_branch,
    language: payload.repository.language,
    stargazersCount: payload.repository.stargazers_count,
    forksCount: payload.repository.forks_count,
    openIssuesCount: payload.repository.open_issues_count,
    githubCreatedAt: payload.repository.created_at,
    githubUpdatedAt: payload.repository.updated_at,
  };
}

/**
 * Extract issue information from webhook payload
 */
export function extractIssueInfo(payload: any) {
  if (!payload.issue) {
    return null;
  }

  return {
    githubId: payload.issue.id,
    number: payload.issue.number,
    title: payload.issue.title,
    body: payload.issue.body,
    state: payload.issue.state as 'open' | 'closed',
    labels: payload.issue.labels?.map((label: any) => label.name) || [],
    assigneeGithubId: payload.issue.assignee?.id || null,
    creatorGithubId: payload.issue.user?.id,
    githubCreatedAt: payload.issue.created_at,
    githubUpdatedAt: payload.issue.updated_at,
    githubClosedAt: payload.issue.closed_at,
  };
}

/**
 * Extract collaborator information from webhook payload
 */
export function extractCollaboratorInfo(payload: any) {
  // Member events
  if (payload.member) {
    return {
      githubId: payload.member.id,
      login: payload.member.login,
      avatarUrl: payload.member.avatar_url,
      role: 'write' as const, // Default role for member events
      permissions: {
        admin: false,
        maintain: false,
        push: true,
        triage: true,
        pull: true,
      },
    };
  }

  // Membership events (for organizations)
  if (payload.membership?.user) {
    return {
      githubId: payload.membership.user.id,
      login: payload.membership.user.login,
      avatarUrl: payload.membership.user.avatar_url,
      role: payload.membership.role as 'admin' | 'write' | 'read',
      permissions: {
        admin: payload.membership.role === 'admin',
        maintain: false,
        push: payload.membership.role !== 'read',
        triage: true,
        pull: true,
      },
    };
  }

  return null;
}

/**
 * Determine the operation type from webhook payload
 */
export function getWebhookOperation(action: string): 'create' | 'update' | 'delete' {
  switch (action) {
    case 'opened':
    case 'created':
    case 'added':
      return 'create';
    case 'closed':
    case 'deleted':
    case 'removed':
      return 'delete';
    case 'edited':
    case 'reopened':
    case 'labeled':
    case 'unlabeled':
    case 'assigned':
    case 'unassigned':
    case 'synchronize':
    default:
      return 'update';
  }
}

/**
 * Get entity type from GitHub event
 */
export function getEntityType(event: string): 'repository' | 'issue' | 'collaborator' {
  switch (event) {
    case 'repository':
      return 'repository';
    case 'issues':
      return 'issue';
    case 'member':
    case 'membership':
      return 'collaborator';
    default:
      return 'repository'; // Default fallback
  }
}

/**
 * Get entity ID from webhook payload
 */
export function getEntityId(payload: any, entityType: string): string {
  switch (entityType) {
    case 'repository':
      return payload.repository?.id?.toString() || '';
    case 'issue':
      return payload.issue?.id?.toString() || '';
    case 'collaborator':
      return payload.member?.id?.toString() || payload.membership?.user?.id?.toString() || '';
    default:
      return '';
  }
}