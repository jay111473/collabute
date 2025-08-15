# GitHub App Setup Guide

## Overview

This guide explains how to set up the GitHub App for Collabute's onboarding flow. The integration shows immediately after users submit their basic information during onboarding.

## User Flow

### For Developers and Startup Founders
1. User fills in basic account information (name, email, password, etc.)
2. User clicks "Sign Up"
3. **GitHub App installation screen appears** (NEW)
4. User clicks "Install GitHub App"
5. User is redirected to GitHub to install the app
6. After installation, user returns to complete account creation
7. User is redirected to dashboard

### For Team Leads
- GitHub integration remains as Step 5 in the multi-step wizard

### For Designers
- No GitHub integration required

## GitHub App Configuration

### 1. Create a GitHub App

1. Go to https://github.com/settings/apps/new
2. Fill in the following details:

**GitHub App name**: Collabute
**Homepage URL**: https://yourdomain.com
**Webhook URL**: https://yourdomain.com/api/webhooks/github (optional)

**User authorization callback URL**: 
```
https://yourdomain.com/api/auth/github/callback
```

**Setup URL (Post installation)**: 
```
https://yourdomain.com/api/auth/github/installation/callback
```

**Webhook Active**: ☑️ (optional)

### 2. Permissions

Configure the following permissions for your GitHub App:

**Repository permissions:**
- Issues: Read & Write
- Pull requests: Read & Write
- Contents: Read (optional)
- Metadata: Read

**Account permissions:**
- Email addresses: Read
- Profile: Read

### 3. Events (Optional)

Subscribe to the following events if using webhooks:
- Issues
- Issue comment
- Pull request
- Pull request review
- Pull request review comment

### 4. Where can this GitHub App be installed?

Choose based on your needs:
- Any account (recommended for public apps)
- Only on this account (for private/testing)

### 5. Generate Private Key

After creating the app:
1. Scroll to "Private keys" section
2. Click "Generate a private key"
3. Save the downloaded .pem file securely

## Environment Variables

Add these to your `.env.local`:

```env
# GitHub OAuth (for user authentication)
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_oauth_client_id

# GitHub App
NEXT_PUBLIC_GITHUB_APP_SLUG=collabute
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
your_private_key_content_here
-----END RSA PRIVATE KEY-----"
```

## Implementation Details

### Key Components

1. **`components/github-integration.tsx`**
   - Displays GitHub App installation UI
   - Handles installation flow
   - Shows after basic info submission

2. **`components/auth/components/create-account.tsx`**
   - Modified to show GitHub integration before account creation
   - Stores pending account data during GitHub flow
   - Completes account creation after GitHub step

3. **`app/api/auth/github/installation/callback/route.ts`**
   - Handles GitHub App installation callback
   - Processes installation_id
   - Redirects back to onboarding flow

### Flow Diagram

```
User Submits Basic Info
         ↓
   GitHub App Screen
         ↓
  User Clicks Install
         ↓
  Redirect to GitHub
         ↓
  User Installs App
         ↓
 Callback to Our App
         ↓
  Account Created
         ↓
  Redirect to Dashboard
```

## Testing

1. Set up a test GitHub App following the steps above
2. Use ngrok or similar for local testing:
   ```bash
   ngrok http 3000
   ```
3. Update GitHub App URLs with ngrok URL
4. Test the complete flow:
   - Create a developer account
   - Verify GitHub App installation appears
   - Install the app
   - Confirm account creation completes

## Security Considerations

1. **CSRF Protection**: State parameter is used for all OAuth flows
2. **Private Key Security**: Store GitHub App private key securely
3. **Token Storage**: Access tokens are stored encrypted in database
4. **Scope Limitation**: Request minimum required permissions

## Troubleshooting

### App installation not showing
- Check NEXT_PUBLIC_GITHUB_APP_SLUG is set correctly
- Verify GitHub App is set to public or user has access

### Installation callback fails
- Ensure Setup URL is configured correctly in GitHub App settings
- Check server logs for detailed error messages

### Account creation fails after GitHub step
- Verify pending account data is preserved
- Check Convex Auth configuration
- Review browser console for errors

## Next Steps

After setup:
1. Test with real GitHub accounts
2. Configure webhooks for real-time updates
3. Implement repository selection UI
4. Add GitHub organization support