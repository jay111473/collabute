import { Message, TypingEvent, UserPresenceEvent } from '@/types/chat'

class ChatSocket {
  private userId: string | null = null
  private token: string | null = null
  private messageHandlers: ((data: any) => void)[] = []
  private typingHandlers: ((data: TypingEvent) => void)[] = []
  private presenceHandlers: ((data: UserPresenceEvent) => void)[] = []
  private pollingInterval: NodeJS.Timeout | null = null
  private eventSource: EventSource | null = null
  private activeConversations: Set<string> = new Set()
  private lastMessageTimestamp: { [conversationId: string]: string } = {}

  connect(token: string, userId: string) {
    if (this.isConnected) {
      return // Already connected
    }

    this.userId = userId
    this.token = token
    this.setupPolling()
    this.setupServerSentEvents()
  }

  private setupPolling() {
    // Poll for new messages every 2 seconds
    this.pollingInterval = setInterval(() => {
      this.pollForUpdates()
    }, 2000)
  }

  private setupServerSentEvents() {
    if (!this.token || !this.userId) return

    // Use Server-Sent Events for real-time updates when available
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
    this.eventSource = new EventSource(`${apiUrl}/api/chat/events?token=${this.token}&userId=${this.userId}`)
    
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleRealTimeEvent(data)
      } catch (error) {
        console.error('Failed to parse SSE data:', error)
      }
    }

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error)
      // Fall back to polling only
    }
  }

  private async pollForUpdates() {
    if (!this.token || this.activeConversations.size === 0) return

    try {
      for (const conversationId of this.activeConversations) {
        await this.pollConversationMessages(conversationId)
      }
    } catch (error) {
      console.error('Polling error:', error)
    }
  }

  private async pollConversationMessages(conversationId: string) {
    if (!this.token) return

    try {
      const lastTimestamp = this.lastMessageTimestamp[conversationId] || new Date(0).toISOString()
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
      
      const response = await fetch(
        `${apiUrl}/api/messages?where[conversation][equals]=${conversationId}&where[createdAt][greater_than]=${lastTimestamp}&sort=createdAt`,
        {
          headers: {
            Authorization: `JWT ${this.token}`,
          },
        }
      )

      if (!response.ok) return

      const data = await response.json()
      const newMessages = data.docs || []

      if (newMessages.length > 0) {
        // Update last timestamp
        this.lastMessageTimestamp[conversationId] = newMessages[newMessages.length - 1].createdAt

        // Notify handlers of new messages
        newMessages.forEach((message: any) => {
          this.messageHandlers.forEach(handler => handler({
            ...message,
            conversationId
          }))
        })
      }
    } catch (error) {
      console.error('Failed to poll messages:', error)
    }
  }

  private handleRealTimeEvent(data: any) {
    switch (data.type) {
      case 'new_message':
        this.messageHandlers.forEach(handler => handler(data.payload))
        break
      case 'message_updated':
        this.messageHandlers.forEach(handler => handler({ ...data.payload, type: 'updated' }))
        break
      case 'message_deleted':
        this.messageHandlers.forEach(handler => handler({ ...data.payload, type: 'deleted' }))
        break
      case 'typing_start':
        this.typingHandlers.forEach(handler => handler(data.payload))
        break
      case 'typing_stop':
        this.typingHandlers.forEach(handler => handler({ ...data.payload, isTyping: false }))
        break
      case 'user_online':
        this.presenceHandlers.forEach(handler => handler({ userId: data.payload.userId, isOnline: true }))
        break
      case 'user_offline':
        this.presenceHandlers.forEach(handler => handler({ userId: data.payload.userId, isOnline: false }))
        break
    }
  }

  // Join conversation room
  joinConversation(conversationId: string) {
    this.activeConversations.add(conversationId)
    
    // Initialize last message timestamp for this conversation
    if (!this.lastMessageTimestamp[conversationId]) {
      this.lastMessageTimestamp[conversationId] = new Date().toISOString()
    }

    // Immediately poll for recent messages
    this.pollConversationMessages(conversationId)
  }

  // Leave conversation room
  leaveConversation(conversationId: string) {
    this.activeConversations.delete(conversationId)
    delete this.lastMessageTimestamp[conversationId]
  }

  // Send real-time message (HTTP-based)
  async sendMessage(conversationId: string, message: { content: string; type: string; replyTo?: string; tempId: string }) {
    if (!this.token) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const response = await fetch(`${apiUrl}/api/messages`, {
        method: 'POST',
        headers: {
          Authorization: `JWT ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: conversationId,
          content: message.content,
          type: message.type,
          replyTo: message.replyTo,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`)
      }

      const savedMessage = await response.json()
      
      // Immediately notify handlers (optimistic update)
      this.messageHandlers.forEach(handler => handler({
        ...savedMessage.doc,
        conversationId,
        tempId: message.tempId
      }))

      return savedMessage.doc
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  // Typing indicators (HTTP-based with debouncing)
  private typingTimeouts: { [conversationId: string]: NodeJS.Timeout } = {}

  startTyping(conversationId: string) {
    this.sendTypingStatus(conversationId, true)
    
    // Clear existing timeout
    if (this.typingTimeouts[conversationId]) {
      clearTimeout(this.typingTimeouts[conversationId])
    }
    
    // Auto-stop typing after 3 seconds
    this.typingTimeouts[conversationId] = setTimeout(() => {
      this.stopTyping(conversationId)
    }, 3000)
  }

  stopTyping(conversationId: string) {
    this.sendTypingStatus(conversationId, false)
    
    if (this.typingTimeouts[conversationId]) {
      clearTimeout(this.typingTimeouts[conversationId])
      delete this.typingTimeouts[conversationId]
    }
  }

  private async sendTypingStatus(conversationId: string, isTyping: boolean) {
    if (!this.token || !this.userId) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
      await fetch(`${apiUrl}/api/chat/typing`, {
        method: 'POST',
        headers: {
          Authorization: `JWT ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          userId: this.userId,
          isTyping,
        }),
      })
    } catch (error) {
      console.error('Failed to send typing status:', error)
    }
  }

  // Mark message as read (HTTP-based)
  async markAsRead(conversationId: string, messageId: string) {
    if (!this.token) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
      await fetch(`${apiUrl}/api/chat/read`, {
        method: 'POST',
        headers: {
          Authorization: `JWT ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          messageId,
          userId: this.userId,
        }),
      })
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  // Event handler registration
  onMessage(handler: (data: any) => void) {
    this.messageHandlers.push(handler)
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler)
    }
  }

  onTyping(handler: (data: TypingEvent) => void) {
    this.typingHandlers.push(handler)
    return () => {
      this.typingHandlers = this.typingHandlers.filter(h => h !== handler)
    }
  }

  onPresence(handler: (data: UserPresenceEvent) => void) {
    this.presenceHandlers.push(handler)
    return () => {
      this.presenceHandlers = this.presenceHandlers.filter(h => h !== handler)
    }
  }

  // Get connection status
  get isConnected() {
    return this.token !== null && this.userId !== null
  }

  // Disconnect
  disconnect() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }

    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    // Clear all typing timeouts
    Object.values(this.typingTimeouts).forEach(timeout => clearTimeout(timeout))
    this.typingTimeouts = {}

    this.token = null
    this.userId = null
    this.activeConversations.clear()
    this.lastMessageTimestamp = {}
    this.messageHandlers = []
    this.typingHandlers = []
    this.presenceHandlers = []
  }
}

export const chatSocket = new ChatSocket() 