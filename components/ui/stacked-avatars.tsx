import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Id } from "@/convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  name?: string;
  profilePicture?: Id<"media">;
}

interface StackedAvatarsProps {
  users: (User | null)[];
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8", 
  lg: "h-10 w-10"
};

export function StackedAvatars({ 
  users, 
  maxDisplay = 5, 
  size = "md",
  className = ""
}: StackedAvatarsProps) {
  const validUsers = users.filter(Boolean) as User[];
  const displayUsers = validUsers.slice(0, maxDisplay);
  const remainingCount = validUsers.length - maxDisplay;

  if (validUsers.length === 0) {
    return null;
  }

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {displayUsers.map((user, index) => {
        // For now, use a placeholder or generate avatar URL
        const profilePictureUrl = user.profilePicture 
          ? `https://avatar.vercel.sh/${user.name || user._id}.png`
          : "";
        
        return (
          <Avatar 
            key={user._id} 
            className={`${sizeClasses[size]} border-2 border-darkGray ring-2 ring-black`}
            style={{ zIndex: displayUsers.length - index }}
          >
            <AvatarImage 
              src={profilePictureUrl} 
              alt={user.name || "User"}
            />
            <AvatarFallback className="bg-darkPrimary/20 text-darkPrimary text-xs">
              {user.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        );
      })}
      {remainingCount > 0 && (
        <div 
          className={`${sizeClasses[size]} rounded-full bg-darkPrimary/20 text-darkPrimary flex items-center justify-center text-xs border-2 border-darkGray ring-2 ring-black font-medium`}
          style={{ zIndex: 0 }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
} 