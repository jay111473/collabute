import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Paperclip, Smile, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { validateMessageContent, validateMessageRate, sanitizeMessage, containsProfanity } from '@/lib/utils/chat-validation'

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>
  onStartTyping: () => void
  onStopTyping: () => void
  disabled?: boolean
}

export const MessageInput = ({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  disabled = false,
}: MessageInputProps) => {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [lastMessageTime, setLastMessageTime] = useState(0)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMessage(value)
    setValidationError(null) // Clear validation error on input change

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }

    // Validate message length in real-time
    if (value.length > 5000) {
      setValidationError('Message is too long (max 5000 characters)')
    }

    // Typing indicator logic
    if (value.trim() && !isTyping) {
      setIsTyping(true)
      onStartTyping()
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      onStopTyping()
    }, 2000)

    // Stop typing if input is empty
    if (!value.trim() && isTyping) {
      setIsTyping(false)
      onStopTyping()
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }

  const handleSend = async () => {
    const trimmedMessage = message.trim()
    
    // Basic validation
    if (!trimmedMessage || isSending || disabled) return

    // Validate message content
    const contentValidation = validateMessageContent(trimmedMessage)
    if (!contentValidation.isValid) {
      setValidationError(contentValidation.error)
      return
    }

    // Rate limiting validation
    const rateValidation = validateMessageRate(lastMessageTime)
    if (!rateValidation.isValid) {
      setValidationError(rateValidation.error)
      return
    }

    // Profanity check
    if (containsProfanity(trimmedMessage)) {
      setValidationError('Message contains inappropriate content')
      return
    }

    try {
      setIsSending(true)
      setValidationError(null)
      
      // Sanitize message before sending
      const sanitizedMessage = sanitizeMessage(trimmedMessage)
      
      await onSendMessage(sanitizedMessage)
      
      // Update last message time for rate limiting
      setLastMessageTime(Date.now())
      
      setMessage('')
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }

      // Stop typing
      if (isTyping) {
        setIsTyping(false)
        onStopTyping()
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setValidationError(error instanceof Error ? error.message : 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Check if send button should be disabled
  const isSendDisabled = !message.trim() || 
                        isSending || 
                        disabled || 
                        !!validationError ||
                        message.length > 5000

  return (
    <div className="flex flex-col gap-3">
      {/* Validation Error */}
      {validationError && (
        <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {validationError}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        <Button
          size="sm"
          className="text-gray-400 hover:text-white p-2"
          disabled={disabled}
          title="Attach file (coming soon)"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className={cn(
              'min-h-[40px] max-h-[120px] resize-none bg-darkGray border-white/10 text-white placeholder-gray-400 pr-12',
              'focus:border-darkPrimary focus:ring-1 focus:ring-darkPrimary',
              validationError && 'border-red-400 focus:border-red-400 focus:ring-red-400'
            )}
            disabled={disabled || isSending}
            rows={1}
            maxLength={5000}
          />
          
          {/* Character count */}
          {message.length > 4000 && (
            <div className={cn(
              'absolute -top-6 right-2 text-xs',
              message.length > 5000 ? 'text-red-400' : 'text-gray-400'
            )}>
              {message.length}/5000
            </div>
          )}
          
          {/* Emoji Button */}
          <Button
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white p-1"
            disabled={disabled}
            title="Add emoji (coming soon)"
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={isSendDisabled}
          className={cn(
            'bg-darkPrimary hover:bg-darkPrimary/80 text-white p-2 transition-all',
            isSendDisabled && 'opacity-50 cursor-not-allowed'
          )}
          title={
            !message.trim() ? 'Type a message to send' :
            validationError ? validationError :
            'Send message'
          }
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Hint Text */}
      <div className="flex justify-between items-center text-xs text-gray-500 px-1">
        <span>Press Enter to send, Shift+Enter for new line</span>
        {isSending && (
          <span className="text-blue-400">Sending...</span>
        )}
      </div>
    </div>
  )
} 