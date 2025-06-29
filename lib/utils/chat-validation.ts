import { z } from 'zod'

// Base validation schemas
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(254, 'Email address is too long')

export const messageContentSchema = z
  .string()
  .min(1, 'Message cannot be empty')
  .max(5000, 'Message is too long (max 5000 characters)')
  .refine(
    (content) => content.trim().length > 0,
    'Message cannot be only whitespace'
  )

export const conversationNameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name is too long (max 100 characters)')
  .refine(
    (name) => name.trim().length > 0,
    'Name cannot be only whitespace'
  )

export const conversationDescriptionSchema = z
  .string()
  .max(500, 'Description is too long (max 500 characters)')
  .optional()

// Conversation creation schema
export const createConversationSchema = z.object({
  type: z.enum(['private', 'group', 'project'], {
    required_error: 'Please select a conversation type',
  }),
  name: z.string().optional(),
  description: conversationDescriptionSchema,
  participantEmail: emailSchema,
}).refine(
  (data) => {
    // Name is required for group and project conversations
    if ((data.type === 'group' || data.type === 'project')) {
      if (!data.name || !data.name.trim()) {
        return false
      }
      // Validate name length and content
      return conversationNameSchema.safeParse(data.name).success
    }
    return true
  },
  {
    message: 'Name is required for group and project conversations',
    path: ['name'],
  }
)

// Message validation schema
export const sendMessageSchema = z.object({
  content: messageContentSchema,
  type: z.enum(['text', 'image', 'video', 'file', 'system']).default('text'),
  replyTo: z.string().optional(),
})

// Search validation schema
export const searchConversationsSchema = z.object({
  query: z
    .string()
    .max(100, 'Search query is too long')
    .optional(),
  limit: z
    .number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(50),
  offset: z
    .number()
    .min(0, 'Offset must be non-negative')
    .default(0),
})

// Participant validation
export const participantSchema = z.object({
  user: z.union([z.string(), z.number()]),
  role: z.enum(['admin', 'moderator', 'member']),
  notifications: z.enum(['all', 'mentions', 'muted']),
})

// Validation utility functions
export const validateEmail = (email: string) => {
  const result = emailSchema.safeParse(email)
  return {
    isValid: result.success,
    error: result.success ? null : result.error.errors[0]?.message
  }
}

export const validateMessageContent = (content: string) => {
  const result = messageContentSchema.safeParse(content)
  return {
    isValid: result.success,
    error: result.success ? null : result.error.errors[0]?.message
  }
}

export const validateConversationName = (name: string) => {
  const result = conversationNameSchema.safeParse(name)
  return {
    isValid: result.success,
    error: result.success ? null : result.error.errors[0]?.message
  }
}

export const validateSearchQuery = (query: string) => {
  if (query.length > 100) {
    return {
      isValid: false,
      error: 'Search query is too long'
    }
  }
  return {
    isValid: true,
    error: null
  }
}

// Content filtering utilities
export const containsProfanity = (content: string): boolean => {
  // Basic profanity filter - in production, use a more sophisticated solution
  const profanityWords = ['spam', 'scam'] // Add more words as needed
  const lowerContent = content.toLowerCase()
  return profanityWords.some(word => lowerContent.includes(word))
}

export const sanitizeMessage = (content: string): string => {
  // Remove excessive whitespace
  return content.trim().replace(/\s+/g, ' ')
}

// Rate limiting validation
export const validateMessageRate = (
  lastMessageTime: number,
  minInterval: number = 1000 // 1 second minimum between messages
): { isValid: boolean; error: string | null; remainingTime?: number } => {
  const now = Date.now()
  const timeSinceLastMessage = now - lastMessageTime
  
  if (timeSinceLastMessage < minInterval) {
    const remainingTime = minInterval - timeSinceLastMessage
    return {
      isValid: false,
      error: `Please wait ${Math.ceil(remainingTime / 1000)} seconds before sending another message`,
      remainingTime
    }
  }
  
  return {
    isValid: true,
    error: null
  }
}

// File validation for attachments
export const validateFileAttachment = (file: File) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 10MB'
    }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not supported'
    }
  }

  return {
    isValid: true,
    error: null
  }
}

// Export type definitions
export type CreateConversationFormData = z.infer<typeof createConversationSchema>
export type SendMessageFormData = z.infer<typeof sendMessageSchema>
export type SearchConversationsData = z.infer<typeof searchConversationsSchema> 