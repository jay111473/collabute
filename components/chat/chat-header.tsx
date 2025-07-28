import { Phone, Video, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Conversation, Participant } from "@/types/chat";
import { Media, User } from "@/types/convex";

interface ChatHeaderProps {
  conversation: Conversation;
  currentUserId: string;
  onlineUsers: string[];
}

export const ChatHeader = ({
  conversation,
  currentUserId,
  onlineUsers,
}: ChatHeaderProps) => {
  // Get conversation display info
  const getConversationDisplay = () => {
    if (conversation.type === "private") {
      const otherParticipant = conversation.participants.find(
        (p) => (p.user as User)._id.toString() !== currentUserId
      );
      const otherUser = otherParticipant?.user as User;

      return {
        title: otherUser?.name || "Unknown User",
        avatar: otherUser?.profilePicture,
        subtitle: onlineUsers.includes(otherUser?._id.toString() || "")
          ? "Online"
          : "Offline",
        isOnline: onlineUsers.includes(otherUser?._id.toString() || ""),
      };
    }

    const activeParticipants = conversation.participants.filter(
      (p) => !p.leftAt
    );
    const onlineCount = activeParticipants.filter((p) =>
      onlineUsers.includes((p.user as User)._id.toString())
    ).length;

    return {
      title: conversation.name || conversation.title,
      avatar: conversation.avatar,
      subtitle: `${activeParticipants.length} members${
        onlineCount > 0 ? `, ${onlineCount} online` : ""
      }`,
      isOnline: onlineCount > 0,
    };
  };

  const { title, avatar, subtitle, isOnline } = getConversationDisplay();

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={(avatar as Media)?.url || ""} alt={title} />
            <AvatarFallback className="bg-darkGray text-white">
              {getInitials(title)}
            </AvatarFallback>
          </Avatar>

          {/* Online indicator for private conversations */}
          {conversation.type === "private" && isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
          )}
        </div>

        {/* Conversation Info */}
        <div>
          <h2 className="font-semibold text-white">{title}</h2>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-400">{subtitle}</p>
            {conversation.type === "project" && (
              <Badge variant="outline" className="text-xs">
                Project
              </Badge>
            )}
            {conversation.type === "group" && (
              <Badge variant="outline" className="text-xs">
                Group
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {conversation.type === "private" && (
          <>
            <Button
              size="sm"
              className="text-gray-400 hover:text-white"
              disabled
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              className="text-gray-400 hover:text-white"
              disabled
            >
              <Video className="w-4 h-4" />
            </Button>
          </>
        )}

        <Button size="sm" className="text-gray-400 hover:text-white">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
