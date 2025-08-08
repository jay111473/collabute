import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfilePicture } from "@/hooks/use-media-convex";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

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

const sizeClasses = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-xs",
  lg: "w-12 h-12 text-sm",
  xl: "w-16 h-16 text-base",
};

export const SafeAvatar = ({
  user,
  className,
  fallbackUrl,
  showLoadingState = true,
  size = "md",
}: SafeAvatarProps) => {
  const { profilePictureUrl, loading } = useProfilePicture(user, fallbackUrl);

  // Get user initials for fallback
  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Loading state
  if (loading && showLoadingState) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          "bg-darkGray animate-pulse rounded-full",
          className
        )}
      />
    );
  }

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage
        src={profilePictureUrl || ""}
        alt={user?.name || "User"}
        className="object-cover"
      />
      <AvatarFallback className="bg-darkGray text-white">
        {getInitials(user?.name)}
      </AvatarFallback>
    </Avatar>
  );
};

// Variant for when you already have the media URL (no additional fetching)
interface DirectAvatarProps {
  imageUrl?: string | null;
  name?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const DirectAvatar = ({
  imageUrl,
  name,
  className,
  size = "md",
}: DirectAvatarProps) => {
  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage
        src={imageUrl || ""}
        alt={name || "User"}
        className="object-cover"
      />
      <AvatarFallback className="bg-darkGray text-white">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
};

// Hook version for when you need just the URL
export { useProfilePicture } from "@/hooks/use-media-convex";
