# GitHub Integration for Onboarding

## Overview

This document describes the GitHub app integration implemented for the Collabute platform's onboarding process, similar to Linear's approach. The integration allows users to connect their GitHub accounts during onboarding for seamless project management and issue tracking.

## Implementation Details

### 1. Components Created

#### `components/github-integration.tsx`
- Main GitHub integration UI component
- Displays GitHub connection interface with feature list
- Handles OAuth flow and callback processing
- Supports success/error states and skip functionality

#### API Route: `app/api/auth/github/callback/route.ts`
- Handles GitHub OAuth callback
- Exchanges authorization code for access token
- Retrieves user information and installations
- Redirects back to onboarding with appropriate parameters

### 2. Database Integration

#### Convex Schema Updates
- Utilizes existing `github_profiles` table in schema.ts
- Stores GitHub user data, access tokens, and connection status
- Links GitHub accounts to authenticated users

#### Convex Mutations
- `connectGitHub`: Stores GitHub OAuth data for authenticated users
- `checkGitHubConnection`: Verifies existing GitHub connections
- `disconnectGitHub`: Removes GitHub connections

### 3. Onboarding Flow Integration

#### For Developers and Founders (Startup)
- GitHub integration appears after successful account creation
- Users see GitHub connection screen before dashboard redirect
- Option to skip integration with "I'll do this later" button

#### For Team Leads (Project Managers)
- GitHub integration added as Step 5 in the existing wizard
- Appears after application submission but before final success page
- Required step in the multi-step onboarding process

#### For Designers
- No GitHub integration required (as per requirements)

## User Experience Flow

### Standard Flow (Developers/Founders)
1. User completes account creation form
2. Account is created successfully
3. GitHub integration screen appears
4. User can:
   - Click "Authenticate with GitHub" → OAuth flow
   - Click "I'll do this later" → Skip to dashboard

### Team Lead Flow
1. User completes Steps 1-4 of wizard
2. Application submitted successfully
3. Step 5: GitHub integration screen appears
4. User connects GitHub account
5. Step 6: Final success/completion screen

### OAuth Flow Details
1. User clicks "Authenticate with GitHub"
2. Redirect to GitHub OAuth authorization
3. GitHub redirects to `/api/auth/github/callback`
4. Callback processes OAuth response
5. User data stored in database
6. Redirect back to onboarding with success parameters
7. Success handler completes integration and navigates to dashboard

## Configuration Requirements

### Environment Variables
```env
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

### GitHub OAuth Application Setup
1. Create GitHub OAuth App at https://github.com/settings/applications/new
2. Set Authorization callback URL to: `https://yourdomain.com/api/auth/github/callback`
3. Configure the required environment variables

## Security Features

- CSRF protection using state parameter
- Session storage validation
- User authentication verification
- Secure token storage in database
- No exposure of access tokens in client-side code

## Features Highlighted to Users

The integration showcases these benefits (similar to Linear):
- ✅ Automatically links issues and GitHub pull requests
- ✅ Syncs issue status when PRs are opened, closed, merged, or reverted  
- ✅ No code read permissions required

## Technical Implementation Details

### State Management
- Uses React hooks for local state management
- Integrates with Convex for database operations
- URL parameters for handling OAuth callbacks

### Error Handling
- Comprehensive error handling for OAuth failures
- User-friendly error messages
- Graceful fallback options

### Performance Considerations
- Lazy loading of GitHub integration component
- Optimized callback processing
- Minimal bundle size impact

## Testing Considerations

To test the GitHub integration:

1. Set up GitHub OAuth application
2. Configure environment variables
3. Test developer onboarding flow:
   - Create developer account
   - Verify GitHub integration appears
   - Test OAuth flow
   - Test skip functionality

4. Test team lead onboarding flow:
   - Go through multi-step wizard
   - Verify GitHub integration at Step 5
   - Test OAuth completion
   - Verify final success page

## Future Enhancements

Potential improvements for the GitHub integration:
- Repository selection during onboarding
- GitHub organization management
- Webhook configuration for real-time updates
- GitHub App installation for enhanced permissions
- Integration with existing project workflows

## Files Modified/Created

### New Files
- `components/github-integration.tsx`
- `app/api/auth/github/callback/route.ts`
- `docs/github-integration-onboarding.md`

### Modified Files
- `components/auth/components/create-account.tsx` - Added GitHub integration logic
- `components/auth/TeamLeadWizard.tsx` - Added GitHub integration step
- `convex/githubAuth.ts` - Added connectGitHub mutation

## Notes

- Integration follows Linear's UX patterns for familiarity
- Maintains existing onboarding flow structure
- Provides flexibility for users to skip integration
- Secure implementation following OAuth best practices
- Compatible with existing Convex database schema