"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";

interface UseMessagesOptions {
  conversationId: Id<"conversations">;
  userId: Id<"user">;
  limit?: number;
  before?: number;
}

export function useMessagesConvex(options: UseMessagesOptions): {
  messages: Doc<"messages">[];
  unreadCount: number;
  loading: boolean;
  error: null;
  sendMessage: (content: string, type?: string, metadata?: any) => Promise<any>;
  editMessage: (messageId: Id<"messages">, newContent: string) => Promise<any>;
  deleteMessage: (messageId: Id<"messages">) => Promise<any>;
  markAsRead: () => Promise<any>;
  refetch: () => void;
} {
  const { conversationId, userId, limit, before } = options;

  const messages = useQuery(api.messages.getMessages, {
    conversationId,
    limit,
    before,
  });

  const unreadCount = useQuery(api.messages.getUnreadCount, {
    conversationId,
    userId,
  });

  const sendMessage = useMutation(api.messages.sendMessage);
  const editMessage = useMutation(api.messages.editMessage);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const markAsRead = useMutation(api.messages.markAsRead);

  return {
    messages: messages || [],
    unreadCount: unreadCount || 0,
    loading: messages === undefined,
    error: null,
    sendMessage: async (content: string, type?: string, metadata?: any) => {
      return await sendMessage({
        conversationId,
        senderId: userId,
        content,
        type,
        metadata,
      });
    },
    editMessage: async (messageId: Id<"messages">, newContent: string) => {
      return await editMessage({
        messageId,
        newContent,
        userId,
      });
    },
    deleteMessage: async (messageId: Id<"messages">) => {
      return await deleteMessage({
        messageId,
        userId,
      });
    },
    markAsRead: async () => {
      return await markAsRead({
        conversationId,
        userId,
      });
    },
    refetch: () => {
      // Convex automatically refetches when dependencies change
    },
  };
}

export function useMessageSearch(conversationId: Id<"conversations">, searchTerm: string, limit?: number): {
  messages: Doc<"messages">[];
  loading: boolean;
  error: null;
} {
  const messages = useQuery(
    api.messages.searchMessages,
    searchTerm.trim() ? { conversationId, searchTerm, limit } : "skip"
  );

  return {
    messages: messages || [],
    loading: Boolean(searchTerm.trim()) && messages === undefined,
    error: null,
  };
}

// Combined chat hook for easier usage
export function useChatConvex(conversationId: Id<"conversations">, userId: Id<"user">): {
  messages: Doc<"messages">[];
  unreadCount: number;
  loading: boolean;
  error: null;
  sendMessage: (content: string, type?: string, metadata?: any) => Promise<any>;
  editMessage: (messageId: Id<"messages">, newContent: string) => Promise<any>;
  deleteMessage: (messageId: Id<"messages">) => Promise<any>;
  markAsRead: () => Promise<any>;
  refetch: () => void;
  conversation: Doc<"conversations"> | undefined | null;
  conversationLoading: boolean;
} {
  const messagesHook = useMessagesConvex({ conversationId, userId });
  const conversation = useQuery(api.conversations.getConversationById, {
    conversationId,
    userId,
  });

  return {
    ...messagesHook,
    conversation,
    conversationLoading: conversation === undefined,
  };
}

// Backward compatibility
export function useChat(conversationId: string, userId: string) {
  return useChatConvex(
    conversationId as Id<"conversations">,
    userId as Id<"user">
  );
}