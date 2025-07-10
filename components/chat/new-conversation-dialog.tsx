import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { CreateConversationData } from '@/types/chat'

// Validation schema
const conversationSchema = z.object({
  type: z.enum(['private', 'group', 'project'], {
    required_error: 'Please select a conversation type',
  }),
  name: z.string().optional(),
  description: z.string().optional(),
  participantEmail: z
    .string()
    .min(1, 'Participant email is required')
    .email('Please enter a valid email address')
    .refine(
      (email) => email.length <= 254,
      'Email address is too long'
    ),
}).refine(
  (data) => {
    // Name is required for group and project conversations
    if ((data.type === 'group' || data.type === 'project') && !data.name?.trim()) {
      return false
    }
    return true
  },
  {
    message: 'Name is required for group and project conversations',
    path: ['name'],
  }
)

type ConversationFormData = z.infer<typeof conversationSchema>

interface NewConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateConversation: (data: CreateConversationData) => Promise<void>
  currentUserId: string
}

export const NewConversationDialog = ({
  open,
  onOpenChange,
  onCreateConversation,
  currentUserId,
}: NewConversationDialogProps) => {
  const [isCreating, setIsCreating] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<ConversationFormData>({
    resolver: zodResolver(conversationSchema),
    defaultValues: {
      type: 'private',
      name: '',
      description: '',
      participantEmail: '',
    },
    mode: 'onChange', // Validate on change for better UX
  })

  const conversationType = watch('type')

  const onSubmit = async (data: ConversationFormData) => {
    setSubmitError(null)

    try {
      setIsCreating(true)

      // For now, we'll create a simple conversation
      // In a real app, you'd look up the user by email
      const conversationData: CreateConversationData = {
        type: data.type,
        name: data.type !== 'private' ? data.name?.trim() : undefined,
        description: data.description?.trim() || undefined,
        participants: [
          {
            user: currentUserId,
            role: 'admin',
            notifications: 'all',
          },
          // In a real implementation, you'd resolve the email to a user ID
          {
            user: data.participantEmail.trim(), // This should be a user ID
            role: 'member',
            notifications: 'all',
          },
        ],
      }

      await onCreateConversation(conversationData)
      
      // Reset form and close dialog on success
      reset()
      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create conversation'
      setSubmitError(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      reset()
      setSubmitError(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-black border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">New Conversation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Conversation Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-white">
              Conversation Type <span className="text-red-400">*</span>
            </Label>
            <RadioGroup
              value={conversationType}
              onValueChange={(value) => setValue('type', value as any, { shouldValidate: true })}
              className="space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="private" id="private" className="border-white/20" />
                <Label htmlFor="private" className="text-sm cursor-pointer">
                  Private (1-on-1)
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="group" id="group" className="border-white/20" />
                <Label htmlFor="group" className="text-sm cursor-pointer">
                  Group
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="project" id="project" className="border-white/20" />
                <Label htmlFor="project" className="text-sm cursor-pointer">
                  Project
                </Label>
              </div>
            </RadioGroup>
            {errors.type && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.type.message}
              </p>
            )}
          </div>

          {/* Conversation Name (for group/project) */}
          {(conversationType === 'group' || conversationType === 'project') && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-white">
                Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter conversation name"
                className={`bg-darkGray border-white/10 text-white placeholder-gray-400 ${
                  errors.name ? 'border-red-400 focus:border-red-400' : ''
                }`}
                disabled={isCreating}
              />
              {errors.name && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name.message}
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-white">
              Description
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Optional description"
              className="bg-darkGray border-white/10 text-white placeholder-gray-400 resize-none"
              rows={3}
              disabled={isCreating}
            />
            {errors.description && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Participant Email */}
          <div className="space-y-2">
            <Label htmlFor="participantEmail" className="text-sm font-medium text-white">
              Participant Email <span className="text-red-400">*</span>
            </Label>
            <Input
              id="participantEmail"
              type="email"
              {...register('participantEmail')}
              placeholder="Enter participant's email"
              className={`bg-darkGray border-white/10 text-white placeholder-gray-400 ${
                errors.participantEmail ? 'border-red-400 focus:border-red-400' : ''
              }`}
              disabled={isCreating}
            />
            {errors.participantEmail && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.participantEmail.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Note: In a real implementation, this would search for existing users
            </p>
          </div>

          {/* Submit Error */}
          {submitError && (
            <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-darkPrimary hover:bg-darkPrimary/80 text-white"
              disabled={isCreating || !isValid || !isDirty}
            >
              {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isCreating ? 'Creating...' : 'Create Conversation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 