"use client";

import { useEffect, useState } from "react";
import Talk from "talkjs";
import { talkJsConfig } from "@/lib/config/talkjs";

type UnreadBadgeProps = {
  conversationId: string;
  userId: string;
};

const UnreadBadge = ({ conversationId, userId }: UnreadBadgeProps) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let currentSession: Talk.Session | null = null;

    const setupNotifications = async () => {
      await Talk.ready;
      currentSession = new Talk.Session({
        appId: talkJsConfig.appId,
        me: new Talk.User({ id: userId }),
      });

      // Get the conversation
      const conversation = currentSession.getOrCreateConversation(conversationId);
      
      // Get notifications for the conversation
      const notifications = currentSession.createNotificationFeed({
        conversations: [conversation.id],
        queryOptions: {
          perPage: 1,
        },
      });

      // Listen for updates to the unread count
      notifications.on("unread_count_changed", (unreadCount) => {
        setUnreadCount(unreadCount);
      });
    };

    if (talkJsConfig.appId) {
      setupNotifications();
    }

    return () => {
      if (currentSession) {
        currentSession.destroy();
      }
    };
  }, [conversationId, userId]);

  if (!unreadCount) {
    return null;
  }

  return (
    <div className="absolute -top-2 -right-2 bg-primary2 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
      {unreadCount > 9 ? "9+" : unreadCount}
    </div>
  );
};

export default UnreadBadge; 