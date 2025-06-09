# Floating Navigation Feature Flag

This document explains how to use the PostHog feature flag to toggle between the new floating bottom navigation and the traditional sidebar navigation.

## Feature Flag Setup

### PostHog Configuration

1. **Feature Flag Name**: `floating-navigation`
2. **Type**: Boolean flag
3. **Default Value**: `false` (traditional sidebar)

### Setting up the Feature Flag in PostHog

1. Go to your PostHog dashboard
2. Navigate to "Feature Flags"
3. Create a new feature flag with the key: `floating-navigation`
4. Set the flag to:
   - `true` to enable the floating bottom navigation
   - `false` to use the traditional sidebar navigation

## How It Works

### Components Affected

- `components/dashboard/dashboard-content.tsx` - Main dashboard page
- `components/dashboard/dashboard-layout.tsx` - Layout wrapper for other dashboard pages

### Feature Flag Hook

The `useFloatingNav` hook (`lib/hooks/use-floating-nav.ts`) manages the feature flag state:

```typescript
import { useFeatureFlagEnabled } from 'posthog-js/react';

export const useFloatingNav = () => {
  const isFloatingNavEnabled = useFeatureFlagEnabled('floating-navigation');
  
  return {
    isFloatingNavEnabled: isFloatingNavEnabled ?? false, // Default to false
  };
};
```

### Navigation Modes

#### Traditional Sidebar (Default)
- Desktop: Fixed sidebar on the left
- Mobile: Hamburger menu with slide-in sidebar
- Full-width content area with sidebar

#### Floating Navigation (Feature Flag Enabled)
- All devices: Floating bottom bar with glassmorphism design
- Clean, full-screen layout
- Modern pill-shaped navigation at bottom center

## Usage Examples

### For Development/Testing

```typescript
// Enable for specific users
if (user.email === 'test@example.com') {
  // User will see floating navigation
}

// Enable for percentage of users
// Set in PostHog: 50% rollout
```

### For Gradual Rollout

1. **Phase 1**: Enable for internal team (0% public)
2. **Phase 2**: Enable for 10% of users
3. **Phase 3**: Enable for 50% of users
4. **Phase 4**: Enable for 100% of users

## Benefits

### Floating Navigation
- ✅ Modern, clean design
- ✅ Full-screen content area
- ✅ Consistent across all screen sizes
- ✅ Glassmorphism aesthetic

### Traditional Sidebar
- ✅ Familiar navigation pattern
- ✅ More navigation items visible
- ✅ Desktop-optimized layout
- ✅ Established UX patterns

## Implementation Details

The feature flag is checked in both layout components and conditionally renders:

1. **Floating Mode**: Full-screen layout + floating bottom bar
2. **Sidebar Mode**: Traditional layout with desktop sidebar + mobile menu

Both modes maintain the same functionality and navigation items, just with different UI presentations. 