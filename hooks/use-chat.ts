'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getCookie } from 'cookies-next'
import { chatSocket } from '@/lib/socket'
import { Message, UseChatReturn } from '@/types/chat'
import { User } from '@/types/convex'

interface UseChatProps {
  conversationId: string
  userId: string
  user: User
}

export const useChat = ({ conversationId, userId, user }: UseChatProps): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([])
  const [typing, setTyping] = useState<string[]>([])
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Get token from cookies
  const token = getCookie('token') as string

  // Connect to chat system on mount
  useEffect(() => {
    if (token && userId) {
      chatSocket.connect(token, userId)
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [token, userId])

  // Join conversation and load messages
  useEffect(() => {
    if (conversationId && chatSocket.isConnected) {
      chatSocket.joinConversation(conversationId)
      loadMessages()
    }

    return () => {
      if (conversationId) {
        chatSocket.leaveConversation(conversationId)
      }
    }
  }, [conversationId, chatSocket.isConnected])

  // Set up event listeners
  useEffect(() => {
    const unsubscribeMessage = chatSocket.onMessage((data: any) => {
      if (data.conversationId === conversationId) {
        if (data.type === 'updated') {
          setMessages(prev => prev.map(msg => 
            msg.id === data.id ? { ...msg, ...data } : msg
          ))
        } else if (data.type === 'deleted') {
          setMessages(prev => prev.map(msg => 
            msg.id === data.id ? { ...msg, isDeleted: true } : msg
          ))
        } else {
          // New message
          setMessages(prev => {
            // Remove optimistic update if it exists
            const withoutOptimistic = data.tempId 
              ? prev.filter(msg => msg.tempId !== data.tempId)
              : prev
            
            // Check if message already exists (prevent duplicates)
            const exists = withoutOptimistic.some(msg => msg.id === data.id)
            if (exists) return prev
            
            return [...withoutOptimistic, data]
          })
        }
      }
    })

    const unsubscribeTyping = chatSocket.onTyping((data: any) => {
      if (data.conversationId === conversationId && data.userId !== userId) {
        if (data.isTyping === false) {
          setTyping(prev => prev.filter(id => id !== data.userId))
        } else {
          setTyping(prev => prev.includes(data.userId) ? prev : [...prev, data.userId])
        }
      }
    })

    const unsubscribePresence = chatSocket.onPresence((data: any) => {
      if (data.isOnline) {
        setOnlineUsers(prev => prev.includes(data.userId) ? prev : [...prev, data.userId])
      } else {
        setOnlineUsers(prev => prev.filter(id => id !== data.userId))
      }
    })

    return () => {
      unsubscribeMessage()
      unsubscribeTyping()
      unsubscribePresence()
    }
  }, [conversationId, userId])

  // Load messages from API
  const loadMessages = useCallback(async () => {
    if (!conversationId || !token) return

    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/messages?where[conversation][equals]=${conversationId}&where[isDeleted][not_equals]=true&sort=createdAt&limit=50`,
        {
          headers: {
            Authorization: `JWT ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to load messages: ${response.status}`)
      }

      const data = await response.json()
      setMessages(data.docs || [])
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setLoading(false)
    }
  }, [conversationId, token])

  // Send message
  const sendMessage = useCallback(
    async (content: string, type: string = 'text', replyTo?: string) => {
      if (!content.trim() || !conversationId || !token) return

      const tempId = `temp_${Date.now()}`

      // Optimistic update
      const optimisticMessage: Message = {
        id: tempId,
        conversation: conversationId as any,
        sender: user,
        content: content.trim(),
        type: type as any,
        replyTo: replyTo as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOptimistic: true,
        tempId,
      }

      setMessages(prev => [...prev, optimisticMessage])

      try {
        // Send message via the chat socket (which now handles HTTP)
        const savedMessage = await chatSocket.sendMessage(conversationId, { 
          content: content.trim(), 
          type, 
          replyTo, 
          tempId 
        })

        // Replace optimistic message with saved message
        setMessages(prev => prev.map(msg => 
          msg.tempId === tempId ? savedMessage : msg
        ))
      } catch (error) {
        console.error('Failed to save message:', error)
        
        // Remove optimistic update on error
        setMessages(prev => prev.filter(msg => msg.tempId !== tempId))
        
        throw error
      }
    },
    [conversationId, token, user]
  )

  // Start typing
  const startTyping = useCallback(() => {
    if (!conversationId) return
    
    chatSocket.startTyping(conversationId)
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      chatSocket.stopTyping(conversationId)
    }, 3000)
  }, [conversationId])

  // Stop typing
  const stopTyping = useCallback(() => {
    if (!conversationId) return
    
    chatSocket.stopTyping(conversationId)
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }, [conversationId])

  // Mark as read
  const markAsRead = useCallback(async (messageId: string) => {
    if (!conversationId || !token) return

    try {
      await chatSocket.markAsRead(conversationId, messageId)
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }, [conversationId, token])

  return {
    messages,
    typing,
    onlineUsers,
    loading,
    sendMessage,
    startTyping,
    stopTyping,
    loadMessages,
    markAsRead,
  }
} 