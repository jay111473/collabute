import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useConversations } from "@/hooks/use-conversations";
import { useUserData } from "@/hooks/use-user-data";
import { CreateConversationData } from "@/types/chat";
import { User } from "@/types/dashboard";

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
  conversationDescription,
  relatedProject,
  variant = "outline",
  size = "sm",
  className,
  children,
}: ChatButtonProps) => {
  const router = useRouter();
  const { user } = useUserData();
  const { createConversation } = useConversations(user?.id?.toString() || "");
  const [isCreating, setIsCreating] = useState(false);

  const handleStartChat = async () => {
    if (!user || isCreating) return;

    setIsCreating(true);

    try {
      // Check if conversation already exists for private chats
      // In a real implementation, you'd want to check existing conversations

      const conversationData: CreateConversationData = {
        type: conversationType,
        name: conversationType !== "private" ? conversationName : undefined,
        description: conversationDescription,
        participants: [
          {
            user: user.id,
            role: conversationType === "project" ? "member" : "member",
            notifications: "all",
          },
          {
            user: targetUser.id,
            role: conversationType === "project" ? "admin" : "member",
            notifications: "all",
          },
        ],
        relatedProject,
      };

      const conversation = await createConversation(conversationData);

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
