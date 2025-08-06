'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

const errorMessages: Record<string, string> = {
  'Configuration': 'There was a problem with the authentication configuration.',
  'AccessDenied': 'Access was denied to your account. You may not have permission.',
  'Verification': 'The verification process failed or was cancelled.',
  'Default': 'An unexpected authentication error occurred. Please try again.',
}

function ErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <AlertCircle className="h-12 w-12 text-destructive animate-pulse" />
          </div>
          <Alert variant="destructive" className="w-full">
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
              {errorMessage}
              {error && (
                <div className="mt-2 text-xs font-mono bg-destructive/10 p-2 rounded">
                  Error Code: {error}
                </div>
              )}
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          className="w-full" 
          onClick={() => router.push('/login')}
        >
          Return to Login
        </Button>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => router.push('/')}
        >
          Back to Home
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Suspense fallback={
        <Card className="w-full max-w-md p-6">
          <div className="flex items-center justify-center">
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        </Card>
      }>
        <ErrorContent />
      </Suspense>
    </div>
  )
} 