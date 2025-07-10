import { MessageCircle, Users, Inbox } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  icon?: 'message' | 'users' | 'inbox'
}

const iconMap = {
  message: MessageCircle,
  users: Users,
  inbox: Inbox,
}

export const EmptyState = ({ title, description, icon = 'message' }: EmptyStateProps) => {
  const Icon = iconMap[icon]

  return (
    <div className="flex flex-col items-center justify-center h-full bg-black text-center px-6">
      <div className="w-16 h-16 rounded-full bg-darkGray flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-sm">{description}</p>
    </div>
  )
} 