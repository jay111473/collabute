# GitHub Integration Popup Flow

This document explains the new popup-based GitHub authentication flow that mimics Linear's approach.

## Overview

The GitHub integration now uses a popup window instead of full-page redirects, providing a seamless user experience where users never leave the main application.

## Architecture

### Components

1. **`useGitHubPopupAuth` Hook** (`components/hooks/useGitHubPopupAuth.ts`)
   - Manages popup window lifecycle
   - Handles background polling for auth status
   - Provides comprehensive error handling

2. **GitHub Integration Component** (`components/github-integration.tsx`)
   - UI component that uses the auth hook
   - Displays real-time authentication status
   - Handles user interactions

3. **Auth Status API** (`app/api/auth/github/status/route.ts`)
   - Endpoint for checking authentication progress
   - In-memory store for tracking auth status
   - Automatic cleanup of old entries

4. **Callback Handler** (`app/api/auth/github/installation/callback/route.ts`)
   - Handles GitHub App installation callbacks
   - Supports both popup and redirect flows
   - Sends messages to parent window for popup flow

## Flow Diagram

```
User clicks "Install GitHub App"
         ↓
1. Generate unique status ID and CSRF state
         ↓
2. Open popup window with GitHub App installation URL
         ↓
3. Start background polling for auth status
         ↓
4. User completes installation in popup
         ↓
5. GitHub redirects to callback URL
         ↓
6. Callback handler updates auth status and sends message to parent
         ↓
7. Parent window receives message OR polling detects success
         ↓
8. Popup closes and main UI updates to show success
```

## Key Features

### Real-time Status Updates
- Background polling every 1.5 seconds
- PostMessage communication for instant updates
- Visual feedback in the main UI

### Comprehensive Error Handling
- Popup blocker detection with fallback to redirect
- Network error resilience
- Timeout handling (5-minute limit)
- User cancellation detection

### Security
- CSRF protection via state parameter
- Origin validation for popup messages
- Secure state storage and cleanup

### Fallback Support
- Automatic redirect if popups are blocked
- Backward compatibility with old redirect flow
- Graceful degradation for unsupported browsers

## Configuration

### Environment Variables
```bash
NEXT_PUBLIC_GITHUB_APP_SLUG=your-app-slug
GITHUB_APP_ID=your-app-id
GITHUB_APP_PRIVATE_KEY="your-private-key"
GITHUB_WEBHOOK_SECRET=your-webhook-secret
```

### GitHub App Settings
1. **Installation URL**: `https://your-domain.com/api/auth/github/installation/callback`
2. **Webhook URL**: `https://your-domain.com/api/webhooks/github`
3. **Permissions**: Repository metadata, Issues, Pull requests

## Usage

### Basic Usage
```tsx
import { useGitHubPopupAuth } from './hooks/useGitHubPopupAuth';

const MyComponent = () => {
  const { 
    authState, 
    isConnecting, 
    startAuth, 
    isSuccess 
  } = useGitHubPopupAuth({
    onSuccess: (installationId) => {
      console.log('GitHub connected!', installationId);
    },
    onError: (error) => {
      console.error('Connection failed:', error);
    }
  });

  return (
    <button 
      onClick={() => startAuth('developer')}
      disabled={isConnecting || isSuccess}
    >
      {isSuccess ? 'Connected!' : 'Connect GitHub'}
    </button>
  );
};
```

### Advanced Configuration
```tsx
const auth = useGitHubPopupAuth({
  onSuccess: handleSuccess,
  onError: handleError,
  pollInterval: 2000,     // Poll every 2 seconds
  timeout: 300000         // 5 minute timeout
});
```

## Testing

### Manual Testing
1. Ensure popup blockers are disabled
2. Test with popup blockers enabled (should fallback to redirect)
3. Test manual popup closure (should show cancellation message)
4. Test network issues during polling
5. Verify timeout handling after 5 minutes

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Internet Explorer (fallback to redirect)

## Error Scenarios

### Popup Blocked
- User sees confirmation dialog
- Option to redirect in current tab
- Graceful fallback to old flow

### Network Issues
- Polling continues on intermittent failures
- Clear error messages for persistent issues
- Automatic cleanup and reset

### User Cancellation
- Detects manual popup closure
- Shows appropriate cancellation message
- Resets state for retry

### Timeout
- 5-minute maximum wait time
- Clear timeout message
- Automatic cleanup

## Security Considerations

### CSRF Protection
- Unique state parameter per request
- Server-side state validation
- State parameter includes random component

### Message Validation
- Origin checking for popup messages
- Type validation for message content
- Secure communication between windows

### Data Cleanup
- Automatic cleanup of auth status after use
- Periodic cleanup of old entries
- No persistent storage of sensitive data

## Performance

### Memory Usage
- In-memory auth status store
- Automatic cleanup every 5 minutes
- Minimal memory footprint

### Network Efficiency
- Polling only during active auth
- Efficient API endpoints
- Minimal data transfer

### User Experience
- Instant visual feedback
- Non-blocking main UI
- Seamless popup integration

## Troubleshooting

### Common Issues

1. **Popup not opening**
   - Check popup blocker settings
   - Verify HTTPS in production
   - Test in incognito mode

2. **Polling not working**
   - Check network connectivity
   - Verify API endpoint accessibility
   - Check browser console for errors

3. **Callback not received**
   - Verify GitHub App configuration
   - Check callback URL settings
   - Validate webhook configuration

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('github-auth-debug', 'true');
```

This will log detailed information about the authentication flow to the browser console.