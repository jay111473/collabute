import { User, Media, Project } from "./convex";

export interface Conversation {
  id: string;
  title: string; // Auto-generated display title
  name?: string; // Custom name for group/project conversations
  type: "private" | "group" | "project";
  description?: string;
  avatar?: Media;
  participants: Participant[];
  relatedProject?: Project;
  lastMessage?: Message;
  messageCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  user: User;
  role: "admin" | "moderator" | "member";
  joinedAt: string;
  leftAt?: string;
  lastReadMessage?: Message; // Relationship to last read message
  notifications: "all" | "mentions" | "muted";
}

export interface Message {
  id: number | string;
  conversation: number | Conversation;
  sender: number | User;
  content: string;
  type: "text" | "image" | "video" | "file" | "system";
  attachments?: Attachment[];
  replyTo?: (number | null) | Message;
  isEdited?: boolean | null;
  editedAt?: string;
  isDeleted?: boolean | null;
  deletedAt?: string | null;
  readBy?: ReadReceipt[];
  createdAt: string;
  updatedAt: string;
  isOptimistic?: boolean; // For client-side optimistic updates
  tempId?: string; // Temporary ID for optimistic updates
}

export interface Attachment {
  file: number | Media;
  fileName?: string | null;
  fileSize?: number | null;
  id?: string | null;
}

export interface ReadReceipt {
  user: number | User;
  readAt: string;
  id?: string | null;
}

export interface ConversationsResponse {
  docs: Conversation[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
}

export interface MessagesResponse {
  docs: Message[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
}

// Socket event types
export interface SocketMessage {
  conversationId: string;
  content: string;
  type: string;
  replyTo?: string;
  tempId: string;
}

export interface TypingEvent {
  conversationId: string;
  userId: string;
  username?: string;
}

export interface UserPresenceEvent {
  userId: string;
  isOnline: boolean;
}

// Chat state management types
export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, string[]>;
  onlineUsers: string[];
  loading: boolean;
  error: string | null;
}

// Hook return types
export interface UseChatReturn {
  messages: Message[];
  typing: string[];
  onlineUsers: string[];
  loading: boolean;
  sendMessage: (
    content: string,
    type?: string,
    replyTo?: string
  ) => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
  loadMessages: () => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
}

export interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  createConversation: (
    data: CreateConversationData
  ) => Promise<Conversation | null>;
  loadConversations: () => Promise<void>;
  updateConversation: (
    id: string,
    data: Partial<Conversation>
  ) => Promise<void>;
}

export interface CreateConversationData {
  type: "private" | "group" | "project";
  name?: string;
  description?: string;
  participants: {
    user: string | number;
    role: "admin" | "moderator" | "member";
    notifications: "all" | "mentions" | "muted";
  }[];
  relatedProject?: string | number;
}
