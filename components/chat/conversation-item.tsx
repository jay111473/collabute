import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Conversation } from "@/types/chat";
import { User } from "@/types/convex";
import { SafeAvatar } from "@/components/ui/safe-avatar";
import { cn } from "@/lib/utils";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  currentUserId: string;
}

export const ConversationItem = ({
  conversation,
  isSelected,
  onClick,
  currentUserId,
}: ConversationItemProps) => {
  // Get the other participant for private conversations
  const getConversationDisplay = () => {
    if (conversation.type === "private") {
      const otherParticipant = conversation.participants.find(
        (p) => (p.user as User)._id.toString() !== currentUserId
      );
      const otherUser = otherParticipant?.user as User;

      return {
        title: otherUser?.name || "Unknown User",
        avatar: otherUser?.profilePicture,
        subtitle: conversation.lastMessage?.content || "No messages yet",
      };
    }

    return {
      title: conversation.name || conversation.title,
      avatar: conversation.avatar,
      subtitle: conversation.lastMessage?.content || "No messages yet",
    };
  };

  const { title, avatar, subtitle } = getConversationDisplay();

  // Check if there are unread messages
  const currentParticipant = conversation.participants.find(
    (p) => (p.user as User)._id.toString() === currentUserId
  );
  const lastReadMessageId = currentParticipant?.lastReadMessage?.id;
  const hasUnreadMessages =
    conversation.lastMessage &&
    conversation.lastMessage.id !== lastReadMessageId;



  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 mx-2 rounded-lg cursor-pointer transition-colors",
        isSelected
          ? "bg-darkPrimary/20 border border-darkPrimary/30"
          : "hover:bg-darkGray/50"
      )}
    >
      {/* Avatar */}
      <SafeAvatar 
        user={conversation.type === "private"
          ? (conversation.participants.find(p => (p.user as User)._id.toString() !== currentUserId)?.user as User)
          : { name: title, profilePicture: avatar?._id }
        }
        size="lg"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3
            className={cn(
              "font-medium truncate",
              hasUnreadMessages ? "text-white" : "text-gray-200"
            )}
          >
            {title}
          </h3>
          {conversation.lastMessage && (
            <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
              {formatDistanceToNow(
                new Date(conversation.lastMessage.createdAt),
                {
                  addSuffix: true,
                }
              )}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p
            className={cn(
              "text-sm truncate",
              hasUnreadMessages ? "text-gray-300" : "text-gray-400"
            )}
          >
            {subtitle}
          </p>

          {hasUnreadMessages && (
            <Badge
              variant="default"
              className="ml-2 bg-darkPrimary text-white text-xs px-2 py-1"
            >
              New
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
