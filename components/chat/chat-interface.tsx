import { useRef, useEffect } from 'react'
import { useChatConvex } from '@/hooks/use-messages-convex'
import { Conversation } from '@/types/chat'
import { User } from '@/types/dashboard'
import { ChatHeader } from './chat-header'
import { MessageList } from './message-list'
import { MessageInput } from './message-input'
import { TypingIndicator } from './typing-indicator'

interface ChatInterfaceProps {
  conversation: Conversation
  currentUser: User
}

export const ChatInterface = ({ conversation, currentUser }: ChatInterfaceProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    loading,
    sendMessage,
    markAsRead,
  } = useChatConvex((conversation as any)._id, (currentUser as any)._id)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      markAsRead()
    }
  }, [messages, loading, markAsRead])

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Chat Header */}
      <ChatHeader 
        conversation={conversation} 
        currentUserId={(currentUser as any)._id}
        onlineUsers={[]}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <MessageList 
          messages={messages as any}
          currentUserId={(currentUser as any)._id}
          loading={loading}
        />
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-white/10 p-4">
        <MessageInput
          onSendMessage={(message) => sendMessage(message)}
          disabled={loading}
          onStartTyping={() => {}}
          onStopTyping={() => {}}
        />
      </div>
    </div>
  )
} 