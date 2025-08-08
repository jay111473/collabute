'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useUserConvex } from '@/hooks/use-user-convex'
import { useConversationsConvex } from '@/hooks/use-conversations-convex'
import { ConversationList } from '@/components/chat/conversation-list'
import { ChatInterface } from '@/components/chat/chat-interface'
import { EmptyState } from '@/components/chat/empty-state'
import { Skeleton } from '@/components/ui/skeleton'

export default function ChatPage() {
  const { user, loading: userLoading } = useUserConvex()
  const searchParams = useSearchParams()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  const {
    conversations,
    loading: conversationsLoading,
    error,
  } = useConversationsConvex({ userId: user?._id! })

  // Handle conversation selection from URL params
  useEffect(() => {
    const conversationFromUrl = searchParams.get('conversation')
    if (conversationFromUrl && conversations.length > 0) {
      const foundConversation = conversations.find(conv => conv._id === conversationFromUrl)
      if (foundConversation) {
        setSelectedConversationId(conversationFromUrl)
      }
    }
  }, [searchParams, conversations])

  // Loading state
  if (userLoading) {
    return (
      <div className="flex h-full bg-black">
        <div className="w-80 border-r border-white/10">
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-full bg-darkGray" />
            <Skeleton className="h-16 w-full bg-darkGray" />
            <Skeleton className="h-16 w-full bg-darkGray" />
            <Skeleton className="h-16 w-full bg-darkGray" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-8 w-48 bg-darkGray" />
        </div>
      </div>
    )
  }

  // Error state
  if (!user) {
    return (
      <div className="flex h-full bg-black items-center justify-center">
        <div className="text-white">Unable to load user data</div>
      </div>
    )
  }

  const selectedConversation = conversations.find(conv => conv._id === selectedConversationId)

  return (
    <div className="flex h-full bg-black">
      {/* Conversation List Sidebar */}
      <div className="w-80 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h1 className="text-xl font-semibold text-white">Messages</h1>
        </div>
        
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          loading={conversationsLoading}
          error={error}
          currentUserId={user._id}
        />
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatInterface
            conversation={selectedConversation as any}
            currentUser={user as any}
          />
        ) : (
          <EmptyState
            title="Select a conversation"
            description="Choose a conversation from the sidebar to start messaging"
            icon="message"
          />
        )}
      </div>
    </div>
  )
} 