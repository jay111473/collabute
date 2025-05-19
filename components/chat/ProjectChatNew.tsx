"use client";

import { useCallback, useState } from "react";
import { Session, Chatbox } from "@talkjs/react";
import Talk from "talkjs";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { Project, User, Lead } from "@/types/dashboard";
import { talkJsConfig, isTalkJsConfigured } from "@/lib/config/talkjs";
import UnreadBadge from "./UnreadBadge";

type ProjectChatProps = {
  project: Project;
  currentUser: User;
  lead?: Lead | null;
};

const ProjectChatNew = ({ project, currentUser, lead }: ProjectChatProps) => {
  const [chatVisible, setChatVisible] = useState(false);
  
  // Generate a unique conversation ID for this project and user
  const conversationId = lead 
    ? `project_${project.id}_user_${currentUser.id}_lead_${lead.id}`
    : '';

  // Create current user object for TalkJS
  const syncUser = useCallback(() => {
    return new Talk.User({
      id: currentUser.id.toString(),
      name: currentUser.name,
      email: currentUser.email,
      photoUrl: currentUser.profilePicture?.url || "https://via.placeholder.com/100",
      role: "default",
    });
  }, [currentUser]);

  // Create the conversation with the project lead
  const syncConversation = useCallback(
    (session: Talk.Session) => {
      if (!lead) return null;
      
      const conversation = session.getOrCreateConversation(conversationId);
      
      // Set conversation metadata
      conversation.setAttributes({
        subject: `Project: ${project.title}`,
        photoUrl: project.logo?.url || "https://via.placeholder.com/100",
        custom: {
          projectId: project.id.toString(),
        },
      });

      // Create lead user for TalkJS
      const leadUser = new Talk.User({
        id: lead.id.toString(),
        name: lead.name,
        email: "lead@example.com", // Fallback email if not available
        photoUrl: lead.profilePicture?.url || "https://via.placeholder.com/100",
        role: "lead",
      });

      // Add participants to conversation
      conversation.setParticipant(session.me);
      conversation.setParticipant(leadUser);

      return conversation;
    },
    [project, lead, currentUser, conversationId]
  );

  if (!lead || !isTalkJsConfigured) {
    return null;
  }

  return (
    <div className="relative">
      {!chatVisible ? (
        <div className="relative">
          <Button
            onClick={() => setChatVisible(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Chat with Lead</span>
          </Button>
          <UnreadBadge 
            conversationId={conversationId} 
            userId={currentUser.id.toString()} 
          />
        </div>
      ) : (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 md:p-8">
          <div className="bg-darkGray rounded-lg shadow-lg w-full max-w-lg h-[500px] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-grayBorders">
              <h3 className="text-white font-medium">Chat with {lead.name}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setChatVisible(false)}
                className="text-white hover:bg-gray-800"
              >
                Close
              </Button>
            </div>
            <div className="flex-1">
              <Session appId={talkJsConfig.appId} syncUser={syncUser}>
                <Chatbox
                  syncConversation={syncConversation}
                  style={{ height: "100%" }}
                  theme="collabute-theme"
                />
              </Session>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectChatNew; 