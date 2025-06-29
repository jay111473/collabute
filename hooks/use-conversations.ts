"use client";

import { useState, useEffect, useCallback } from "react";
import { getCookie } from "cookies-next";
import {
  Conversation,
  UseConversationsReturn,
  CreateConversationData,
} from "@/types/chat";

export const useConversations = (userId: string): UseConversationsReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get token from cookies
  const token = getCookie("token") as string;

  // Load conversations from API
  const loadConversations = useCallback(async () => {
    if (!token || !userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/conversations?where[participants.user][equals]=${userId}&sort=-updatedAt&limit=50`,
        {
          headers: {
            Authorization: `JWT ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load conversations: ${response.status}`);
      }

      const data = await response.json();
      setConversations(data.docs || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load conversations";
      setError(errorMessage);
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  // Create new conversation
  const createConversation = useCallback(
    async (data: CreateConversationData): Promise<Conversation | null> => {
      if (!token) return null;

      try {
        setError(null);

        // Ensure current user is included in participants
        const currentUserParticipant = data.participants.find(
          (p) => p.user.toString() === userId
        );
        if (!currentUserParticipant) {
          data.participants.unshift({
            user: userId,
            role: "admin",
            notifications: "all",
          });
        }

        // Add joinedAt timestamp to all participants
        const participantsWithTimestamp = data.participants.map((p) => ({
          ...p,
          joinedAt: new Date().toISOString(),
        }));

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/conversations`,
          {
            method: "POST",
            headers: {
              Authorization: `JWT ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...data,
              participants: participantsWithTimestamp,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to create conversation: ${response.status}`);
        }

        const result = await response.json();
        const newConversation = result.doc;

        // Add to local state
        setConversations((prev) => [newConversation, ...prev]);

        return newConversation;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create conversation";
        setError(errorMessage);
        console.error("Failed to create conversation:", err);
        return null;
      }
    },
    [token, userId]
  );

  // Update conversation
  const updateConversation = useCallback(
    async (id: string, updates: Partial<Conversation>) => {
      if (!token) return;

      try {
        setError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/conversations/${id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `JWT ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to update conversation: ${response.status}`);
        }

        const result = await response.json();
        const updatedConversation = result.doc;

        // Update local state
        setConversations((prev) =>
          prev.map((conv) => (conv.id === id ? updatedConversation : conv))
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update conversation";
        setError(errorMessage);
        console.error("Failed to update conversation:", err);
      }
    },
    [token]
  );

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    loading,
    error,
    createConversation,
    loadConversations,
    updateConversation,
  };
};
