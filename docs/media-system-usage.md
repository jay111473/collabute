# Media System Usage Guide

## Overview

The media system provides safe, efficient access to media files throughout the application. Instead of directly accessing `user.profilePicture.url`, use the provided hooks and components to handle media fetching, loading states, and error handling automatically.

## ⚠️ Problem Solved

**Before (❌ Broken):**
```tsx
// This breaks because profilePicture is an ID, not a Media object
<img src={user.profilePicture?.url} alt={user.name} />
```

**After (✅ Works):**
```tsx
// This works safely with proper loading and error handling
<SafeAvatar user={user} />
```

## 🎯 Quick Start

### 1. For User Avatars (Most Common)

```tsx
import { SafeAvatar } from "@/components/ui/safe-avatar";

// Simple avatar display
<SafeAvatar user={user} />

// With custom size
<SafeAvatar user={user} size="lg" />

// With fallback URL
<SafeAvatar user={user} fallbackUrl="/default-avatar.png" />
```

### 2. For Media URLs Only

```tsx
import { useMediaUrl } from "@/hooks/use-media-convex";

function MyComponent({ user }) {
  const { url, loading } = useMediaUrl(user.profilePicture);
  
  if (loading) return <div>Loading...</div>;
  
  return <img src={url || "/default.png"} alt="Profile" />;
}
```

### 3. For Multiple Users (Batch Loading)

```tsx
import { useProfilePictures } from "@/hooks/use-media-convex";

function UserList({ users }) {
  const { profilePictureMap, loading } = useProfilePictures(users);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {users.map(user => (
        <img 
          key={user._id}
          src={profilePictureMap[user._id] || "/default.png"} 
          alt={user.name} 
        />
      ))}
    </div>
  );
}
```

## 🔧 Available Hooks

### `useMediaUrl(mediaId, fallbackUrl?)`
Get a single media URL safely.

```tsx
const { url, loading } = useMediaUrl(mediaId, "/fallback.png");
```

### `useProfilePicture(user, fallbackUrl?)`
Get profile picture URL for a user.

```tsx
const { profilePictureUrl, loading, hasProfilePicture } = useProfilePicture(user);
```

### `useMultipleMedia(mediaIds)`
Get multiple media objects efficiently.

```tsx
const { mediaMap, loading, getMediaUrl } = useMultipleMedia([id1, id2, id3]);
const url = getMediaUrl(id1);
```

### `useUsersWithMedia(userIds)`
Get users with their profile pictures populated.

```tsx
const { users, loading } = useUsersWithMedia([userId1, userId2]);
// users[0].profilePictureMedia contains the full media object
```

### `useProfilePictures(users)`
Batch load profile pictures for multiple users.

```tsx
const { profilePictureMap, getProfilePictureUrl } = useProfilePictures(users);
const avatarUrl = getProfilePictureUrl(userId);
```

## 🎨 Components

### `SafeAvatar`
The primary component for displaying user avatars.

```tsx
interface SafeAvatarProps {
  user?: {
    _id?: Id<"users">;
    name?: string | null;
    profilePicture?: Id<"media"> | null;
  } | null;
  className?: string;
  fallbackUrl?: string;
  showLoadingState?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

// Usage examples:
<SafeAvatar user={user} size="lg" />
<SafeAvatar user={user} className="border-2 border-blue-500" />
<SafeAvatar user={user} showLoadingState={false} />
```

### `DirectAvatar`
For when you already have the media URL (no additional fetching).

```tsx
<DirectAvatar 
  imageUrl={user.profilePictureUrl} 
  name={user.name} 
  size="md" 
/>
```

## 📚 Convex Functions

### Core Media Functions

- `api.media.getSafeMediaUrl(mediaId?, fallbackUrl?)` - Safe URL fetching
- `api.media.getMultipleMedia(mediaIds)` - Batch media fetching
- `api.media.getUsersWithMedia(userIds)` - Users with populated media
- `api.media.getMediaByIds(ids)` - Array of media objects

### Usage in Components

```tsx
// Direct Convex usage (if hooks don't fit your needs)
const mediaUrl = useQuery(api.media.getSafeMediaUrl, { 
  mediaId: user.profilePicture,
  fallbackUrl: "/default.png" 
});
```

## 🚀 Best Practices

### 1. Always Use SafeAvatar for User Pictures
```tsx
// ✅ Good
<SafeAvatar user={user} />

// ❌ Avoid
<img src={user.profilePicture?.url} />
```

### 2. Batch Load When Possible
```tsx
// ✅ Good - Single query for all users
const { profilePictureMap } = useProfilePictures(users);

// ❌ Avoid - Multiple queries
users.map(user => useProfilePicture(user)) // Creates N queries
```

### 3. Handle Loading States
```tsx
// ✅ Good
const { url, loading } = useMediaUrl(mediaId);
if (loading) return <Skeleton />;

// ❌ Avoid
const url = useQuery(api.media.getMediaUrl, { mediaId });
// No loading state handling
```

### 4. Use Appropriate Sizes
```tsx
// ✅ Good - Choose appropriate size
<SafeAvatar user={user} size="sm" />  // 6x6 (24px)
<SafeAvatar user={user} size="md" />  // 8x8 (32px)
<SafeAvatar user={user} size="lg" />  // 12x12 (48px)
<SafeAvatar user={user} size="xl" />  // 16x16 (64px)
```

## 🔄 Migration Examples

### Typing Indicator (Before/After)

**Before:**
```tsx
<Avatar className="w-8 h-8">
  <AvatarImage
    src={(user.profilePicture as Media)?.url || ""}
    alt={user.name}
  />
  <AvatarFallback className="bg-darkGray text-white text-xs">
    {getInitials(user.name)}
  </AvatarFallback>
</Avatar>
```

**After:**
```tsx
<SafeAvatar user={user} size="md" />
```

### Message Item (Before/After)

**Before:**
```tsx
{showAvatar && (
  <Avatar className="w-8 h-8">
    <AvatarImage src={sender.profilePicture?.url || ""} />
    <AvatarFallback>{getInitials(sender.name)}</AvatarFallback>
  </Avatar>
)}
```

**After:**
```tsx
{showAvatar && (
  <SafeAvatar 
    user={{
      _id: sender._id,
      name: sender.name,
      profilePicture: sender.profilePicture?._id
    }}
    size="md"
  />
)}
```

## 🔍 Troubleshooting

### Common Issues

1. **"Cannot read property 'url' of undefined"**
   - **Cause:** Trying to access `.url` on a media ID
   - **Fix:** Use `useMediaUrl()` or `SafeAvatar`

2. **Multiple network requests for same media**
   - **Cause:** Using individual hooks in loops
   - **Fix:** Use `useMultipleMedia()` or `useProfilePictures()`

3. **Loading state not shown**
   - **Cause:** Not handling loading state from hooks
   - **Fix:** Check `loading` property and show skeleton/spinner

### Performance Tips

1. **Batch media requests** when displaying multiple users
2. **Use `DirectAvatar`** when you already have URLs
3. **Enable loading states** to improve perceived performance
4. **Consider caching** for frequently accessed media

## 📝 Examples in the Codebase

See these files for real implementations:
- `components/chat/typing-indicator.tsx` - SafeAvatar usage
- `components/chat/message-item.tsx` - Enhanced message with media
- `components/chat/conversation-item.tsx` - Conversation avatars
- `hooks/use-media-convex.ts` - All available hooks

This system ensures reliable, performant media access throughout your application! 🎉 