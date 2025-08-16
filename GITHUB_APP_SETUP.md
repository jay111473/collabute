# GitHub App Configuration Guide

## Important: GitHub App Settings

To ensure the GitHub App installation flow works correctly, you need to configure the following in your GitHub App settings:

### 1. Callback URL Configuration

In your GitHub App settings on GitHub:

1. Go to: https://github.com/settings/apps/[your-app-name]
2. Find the **"Callback URL"** field (under General settings)
3. Set it to one of these URLs based on your environment:

#### For Development:
```
http://localhost:3000/api/auth/github/installation/callback
```

#### For Production:
```
https://your-domain.com/api/auth/github/installation/callback
```

### 2. Post Installation Setup URL (Optional but Recommended)

In the same GitHub App settings:

1. Find **"Setup URL (optional)"** field
2. Set it to:

#### For Development:
```
http://localhost:3000/auth/github/complete
```

#### For Production:
```
https://your-domain.com/auth/github/complete
```

This ensures users are redirected back to your app after installation.

### 3. Webhook URL (if using webhooks)

If you're using webhooks, set the webhook URL to:
```
https://your-domain.com/api/webhooks/github
```

### 4. Required Permissions

Ensure your GitHub App has these permissions:
- **Repository permissions:**
  - Contents: Read
  - Metadata: Read
  - Pull requests: Read & Write
  - Issues: Read & Write (if needed)

- **Account permissions:**
  - Email addresses: Read (optional)

### 5. Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_GITHUB_APP_SLUG=your-app-slug
GITHUB_APP_ID=your-app-id
GITHUB_APP_CLIENT_ID=your-client-id
GITHUB_APP_CLIENT_SECRET=your-client-secret
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
your-private-key-here
-----END RSA PRIVATE KEY-----"
```

## Testing the Flow

### Test Popup Flow:
1. Clear your browser cache and cookies
2. Go to `/onboarding`
3. Select Developer or Startup account type
4. Click "Install GitHub App"
5. Complete installation on GitHub
6. Should return to your app automatically

### Test Redirect Flow:
1. If popup is blocked, it will automatically use redirect
2. After GitHub installation, you'll be redirected to `/auth/github/complete`
3. Then automatically continue to your dashboard

## Troubleshooting

### Issue: Stuck on GitHub after installation
**Solution:** Make sure the Callback URL is correctly set in GitHub App settings

### Issue: Popup closes immediately
**Solution:** The new implementation should prevent this, but ensure popups are allowed for your domain

### Issue: "Invalid state" error
**Solution:** Clear cookies and try again. Make sure your app's origin matches the configured URLs

### Issue: Installation succeeds but app doesn't know about it
**Solution:** Check that the callback route is accessible and not blocked by authentication middleware

## Manual Recovery

If a user gets stuck after installation:
1. They can manually navigate to: `/auth/github/complete`
2. Or go directly to: `/onboarding?step=github&github_app_installed=true`
3. The app will continue the signup process from there