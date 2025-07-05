import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Participant } from "@/types/chat";
import { Media, User } from "@/types/dashboard";

interface TypingIndicatorProps {
  typingUsers: string[];
  participants: Participant[];
}

export const TypingIndicator = ({
  typingUsers,
  participants,
}: TypingIndicatorProps) => {
  if (typingUsers.length === 0) return null;

  // Get user details for typing users
  const typingParticipants = participants.filter((p) =>
    typingUsers.includes((p.user as User).id.toString())
  );

  if (typingParticipants.length === 0) return null;

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate typing text
  const getTypingText = () => {
    const names = typingParticipants.map((p) => (p.user as User).name);

    if (names.length === 1) {
      return `${names[0]} is typing...`;
    } else if (names.length === 2) {
      return `${names[0]} and ${names[1]} are typing...`;
    } else {
      return `${names[0]} and ${names.length - 1} others are typing...`;
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Show avatar for first typing user */}
      <div className="w-8 h-8">
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={
              ((typingParticipants[0].user as User).profilePicture as Media)
                .url || ""
            }
            alt={(typingParticipants[0].user as User).name}
          />
          <AvatarFallback className="bg-darkGray text-white text-xs">
            {getInitials((typingParticipants[0].user as User).name)}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Typing indicator */}
      <div className="flex items-center gap-2">
        <div className="bg-darkGray px-3 py-2 rounded-lg">
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-sm">{getTypingText()}</span>
            <div className="flex gap-1">
              <div
                className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
