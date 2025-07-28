import { MessageItem } from "./message-item";
import { Skeleton } from "@/components/ui/skeleton";
import { EnhancedMessage } from "@/types/convex";

interface MessageListProps {
  messages: EnhancedMessage[];
  currentUserId: string;
  loading: boolean;
}

export const MessageList = ({
  messages,
  currentUserId,
  loading,
}: MessageListProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="w-8 h-8 rounded-full bg-darkGray" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24 bg-darkGray" />
              <Skeleton className="h-12 w-full max-w-md bg-darkGray" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center">
        <div className="text-gray-400 mb-2">No messages yet</div>
        <div className="text-gray-500 text-sm">
          Send a message to start the conversation
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => {
        const previousMessage = index > 0 ? messages[index - 1] : null;
        const showAvatar =
          !previousMessage ||
          previousMessage.senderId !== message.senderId ||
          new Date(message._creationTime).getTime() -
            new Date(previousMessage._creationTime).getTime() >
            300000; // 5 minutes

        return (
          <MessageItem
            key={message._id}
            message={message}
            currentUserId={currentUserId}
            showAvatar={showAvatar}
          />
        );
      })}
    </div>
  );
};
