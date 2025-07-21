"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface UseConversationsOptions {
  userId: Id<"user">;
  type?: string;
  projectId?: Id<"projects">;
  limit?: number;
}

export function useConversationsConvex(options: UseConversationsOptions): {
  conversations: any[];
  loading: boolean;
  error: null;
  createConversation: (data: {
    title: string;
    type: string;
    participantIds?: Id<"user">[];
    projectId?: Id<"projects">;
  }) => Promise<any>;
  updateConversation: (conversationId: Id<"conversations">, updates: { title?: string; isArchived?: boolean }) => Promise<any>;
  addParticipant: (conversationId: Id<"conversations">, participantId: Id<"user">, role?: string) => Promise<any>;
  removeParticipant: (conversationId: Id<"conversations">, participantId: Id<"user">) => Promise<any>;
  refetch: () => void;
} {
  const { userId, type, projectId, limit } = options;

  const conversations = useQuery(api.conversations.getConversations, {
    userId,
    type,
    projectId,
    limit,
  });

  const createConversation = useMutation(api.conversations.createConversation);
  const updateConversation = useMutation(api.conversations.updateConversation);
  const addParticipant = useMutation(api.conversations.addParticipant);
  const removeParticipant = useMutation(api.conversations.removeParticipant);

  return {
    conversations: (conversations || []).filter(Boolean),
    loading: conversations === undefined,
    error: null,
    createConversation: async (data: {
      title: string;
      type: string;
      participantIds?: Id<"user">[];
      projectId?: Id<"projects">;
    }) => {
      return await createConversation({
        title: data.title,
        type: data.type,
        createdById: userId,
        projectId: data.projectId,
        participantIds: data.participantIds,
      });
    },
    updateConversation: async (conversationId: Id<"conversations">, updates: { title?: string; isArchived?: boolean }) => {
      return await updateConversation({
        conversationId,
        updates,
        userId,
      });
    },
    addParticipant: async (conversationId: Id<"conversations">, participantId: Id<"user">, role?: string) => {
      return await addParticipant({
        conversationId,
        userId: participantId,
        addedById: userId,
        role,
      });
    },
    removeParticipant: async (conversationId: Id<"conversations">, participantId: Id<"user">) => {
      return await removeParticipant({
        conversationId,
        userId: participantId,
        removedById: userId,
      });
    },
    refetch: () => {
      // Convex automatically refetches when dependencies change
    },
  };
}

export function useConversationById(conversationId: Id<"conversations">, userId: Id<"user">): {
  conversation: any;
  loading: boolean;
  error: null;
} {
  const conversation = useQuery(api.conversations.getConversationById, {
    conversationId,
    userId,
  });

  return {
    conversation,
    loading: conversation === undefined,
    error: null,
  };
}

export function useDirectConversation(userId1: Id<"user">, userId2: Id<"user">): {
  conversation: any;
  loading: boolean;
  error: null;
  createDirectConversation: () => Promise<any>;
} {
  const conversation = useQuery(api.conversations.getDirectConversation, {
    userId1,
    userId2,
  });

  const createDirectConversation = useMutation(api.conversations.createDirectConversation);

  return {
    conversation,
    loading: conversation === undefined,
    error: null,
    createDirectConversation: () => createDirectConversation({ userId1, userId2 }),
  };
}

// Backward compatibility
export function useConversations(userId: string) {
  return useConversationsConvex({ userId: userId as Id<"user"> });
}