import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Message } from '@/types/chat'
import { User } from '@/types/dashboard'
import { cn } from '@/lib/utils'

interface MessageItemProps {
  message: Message
  currentUserId: string
  showAvatar: boolean
}

export const MessageItem = ({ message, currentUserId, showAvatar }: MessageItemProps) => {
  const sender = message.sender as User
  const isCurrentUser = sender.id.toString() === currentUserId
  const isSystemMessage = message.type === 'system'

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // System messages (like user joined, left, etc.)
  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-darkGray/50 text-gray-400 text-sm px-3 py-1 rounded-full">
          {message.content}
        </div>
      </div>
    )
  }

  // Deleted messages
  if (message.isDeleted) {
    return (
      <div className={cn(
        'flex gap-3',
        isCurrentUser ? 'justify-end' : 'justify-start'
      )}>
        {!isCurrentUser && showAvatar && (
          <div className="w-8 h-8" /> // Placeholder for alignment
        )}
        <div className={cn(
          'max-w-xs lg:max-w-md px-3 py-2 rounded-lg',
          'bg-darkGray/30 border border-gray-600 text-gray-500 italic'
        )}>
          This message was deleted
        </div>
        {isCurrentUser && showAvatar && (
          <div className="w-8 h-8" /> // Placeholder for alignment
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      'flex gap-3',
      isCurrentUser ? 'justify-end' : 'justify-start'
    )}>
      {/* Avatar for other users */}
      {!isCurrentUser && (
        <div className="w-8 h-8">
          {showAvatar ? (
            <Avatar className="w-8 h-8">
              <AvatarImage 
                src={typeof sender.profilePicture === 'object' ? sender.profilePicture?.url : undefined}
                alt={sender.name}
              />
              <AvatarFallback className="bg-darkGray text-white text-xs">
                {getInitials(sender.name)}
              </AvatarFallback>
            </Avatar>
          ) : null}
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        'max-w-xs lg:max-w-md',
        isCurrentUser ? 'order-2' : 'order-1'
      )}>
        {/* Sender name and timestamp (for other users) */}
        {!isCurrentUser && showAvatar && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-300">{sender.name}</span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div className={cn(
          'px-3 py-2 rounded-lg break-words',
          isCurrentUser
            ? 'bg-darkPrimary text-white'
            : 'bg-darkGray text-white',
          message.isOptimistic && 'opacity-70'
        )}>
          {/* Reply indicator */}
          {message.replyTo && (
            <div className="mb-2 p-2 bg-black/20 rounded border-l-2 border-gray-500">
              <div className="text-xs text-gray-400">Replying to message</div>
            </div>
          )}

          {/* Message content */}
          <div className="whitespace-pre-wrap">{message.content}</div>

          {/* Edited indicator */}
          {message.isEdited && (
            <div className="text-xs text-gray-400 mt-1">edited</div>
          )}
        </div>

        {/* Timestamp for current user messages */}
        {isCurrentUser && (
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </span>
            {message.isOptimistic && (
              <Badge variant="outline" className="ml-2 text-xs">
                Sending...
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Avatar placeholder for current user */}
      {isCurrentUser && (
        <div className="w-8 h-8 order-1" />
      )}
    </div>
  )
} 