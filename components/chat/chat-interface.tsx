import { useRef, useEffect } from 'react'
import { useChat } from '@/hooks/use-chat'
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
    typing,
    onlineUsers,
    loading,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
  } = useChat({
    conversationId: conversation.id,
    userId: currentUser.id.toString(),
    user: currentUser,
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.sender !== currentUser && !lastMessage.isOptimistic) {
        markAsRead(lastMessage.id.toString())
      }
    }
  }, [messages, loading, currentUser, markAsRead])

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Chat Header */}
      <ChatHeader 
        conversation={conversation} 
        currentUserId={currentUser.id.toString()}
        onlineUsers={onlineUsers}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <MessageList 
          messages={messages}
          currentUserId={currentUser.id.toString()}
          loading={loading}
        />
        
        {/* Typing Indicator */}
        {typing.length > 0 && (
          <TypingIndicator 
            typingUsers={typing}
            participants={conversation.participants}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-white/10 p-4">
        <MessageInput
          onSendMessage={sendMessage}
          onStartTyping={startTyping}
          onStopTyping={stopTyping}
          disabled={loading}
        />
      </div>
    </div>
  )
} 