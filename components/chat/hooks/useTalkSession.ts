"use client";

import { useState, useEffect } from "react";
import Talk from "talkjs";
import { User } from "@/types/dashboard";
import { talkJsConfig } from "@/lib/config/talkjs";

type UseTalkSessionResult = {
  ready: boolean;
  talkSession: Talk.Session | null;
};

export const useTalkSession = (currentUser: User): UseTalkSessionResult => {
  const [talkSession, setTalkSession] = useState<Talk.Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Initialize Talk.js session
    const initTalk = async () => {
      try {
        await Talk.ready;
        
        const session = new Talk.Session({
          appId: talkJsConfig.appId,
          me: new Talk.User({
            id: currentUser.id.toString(),
            name: currentUser.name,
            email: currentUser.email,
            photoUrl: currentUser.profilePicture?.url || "https://via.placeholder.com/100",
            role: "default",
          }),
        });
        
        setTalkSession(session);
        setReady(true);
      } catch (error) {
        console.error("Error initializing TalkJS:", error);
      }
    };

    if (currentUser) {
      initTalk();
    }

    return () => {
      // Cleanup TalkJS session
      if (talkSession) {
        talkSession.destroy();
      }
    };
  }, [currentUser]);

  return { ready, talkSession };
};

export default useTalkSession; 