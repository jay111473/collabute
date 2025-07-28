import { Participant } from "@/types/chat";
import { User } from "@/types/convex";
import { SafeAvatar } from "@/components/ui/safe-avatar";

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
    typingUsers.includes((p.user as User)._id.toString())
  );

  if (typingParticipants.length === 0) return null;

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
      <SafeAvatar user={typingParticipants[0].user as User} size="md" />

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
