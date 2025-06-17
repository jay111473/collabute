'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function ProjectManagersError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="flex items-center gap-2 text-red-500">
        <AlertCircle className="h-6 w-6" />
        <h2 className="text-xl font-semibold">Something went wrong!</h2>
      </div>
      <p className="text-muted-foreground text-center max-w-[500px]">
        We encountered an error while loading the project managers. Please try again later or contact support if the problem persists.
      </p>
      <Button
        variant="outline"
        onClick={reset}
        className="bg-[#111] border-[#222] text-white hover:bg-[#222]"
      >
        Try again
      </Button>
    </div>
  )
} 