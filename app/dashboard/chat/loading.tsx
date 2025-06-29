import { Skeleton } from '@/components/ui/skeleton'

export default function ChatLoading() {
  return (
    <div className="flex h-full bg-black">
      {/* Sidebar Loading */}
      <div className="w-80 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <Skeleton className="h-6 w-24 bg-darkGray" />
        </div>
        
        <div className="p-4 space-y-3">
          <Skeleton className="h-10 w-full bg-darkGray" />
          <Skeleton className="h-10 w-full bg-darkGray" />
        </div>

        <div className="flex-1 p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="w-12 h-12 rounded-full bg-darkGray" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-darkGray" />
                <Skeleton className="h-3 w-1/2 bg-darkGray" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area Loading */}
      <div className="flex-1 flex flex-col">
        {/* Header Loading */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full bg-darkGray" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 bg-darkGray" />
              <Skeleton className="h-3 w-20 bg-darkGray" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-8 h-8 bg-darkGray" />
            <Skeleton className="w-8 h-8 bg-darkGray" />
          </div>
        </div>

        {/* Messages Loading */}
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-full bg-darkGray" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-20 bg-darkGray" />
                <Skeleton className="h-12 w-full max-w-md bg-darkGray" />
              </div>
            </div>
          ))}
        </div>

        {/* Input Loading */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-end gap-2">
            <Skeleton className="w-8 h-8 bg-darkGray" />
            <Skeleton className="flex-1 h-10 bg-darkGray" />
            <Skeleton className="w-8 h-8 bg-darkGray" />
          </div>
        </div>
      </div>
    </div>
  )
} 