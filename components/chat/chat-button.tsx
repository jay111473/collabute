import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useConversationsConvex } from "@/hooks/use-conversations-convex";
import { useUserConvex } from "@/hooks/use-user-convex";
import { User } from "@/types/convex";

interface ChatButtonProps {
  targetUser: User;
  conversationType?: "private" | "project";
  conversationName?: string;
  conversationDescription?: string;
  relatedProject?: number;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export const ChatButton = ({
  targetUser,
  conversationType = "private",
  conversationName,
  relatedProject,
  variant = "outline",
  size = "sm",
  className,
  children,
}: ChatButtonProps) => {
  const router = useRouter();
  const { user } = useUserConvex();
  const { createConversation } = useConversationsConvex({ userId: user?._id! });
  const [isCreating, setIsCreating] = useState(false);

  const handleStartChat = async () => {
    if (!user || isCreating) return;

    setIsCreating(true);

    try {
      // Check if conversation already exists for private chats
      // In a real implementation, you'd want to check existing conversations

      const conversation = await createConversation({
        title:
          conversationType !== "private"
            ? conversationName || `Chat with ${targetUser.name}`
            : `Chat with ${targetUser.name}`,
        type: conversationType,
        participantIds: [(targetUser as any)._id],
        projectId: relatedProject as any,
      });

      if (conversation) {
        // Navigate to chat with the new conversation selected
        router.push(`/dashboard/chat?conversation=${conversation.id}`);
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={handleStartChat}
      variant={variant as ButtonProps["variant"]}
      size={size}
      className={className}
      disabled={isCreating}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      {children || (isCreating ? "Starting..." : "Start Chat")}
    </Button>
  );
};
