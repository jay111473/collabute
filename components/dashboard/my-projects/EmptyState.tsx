import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Layers } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

/**
 * Empty state component displayed when a user has no projects
 */
export const EmptyState: FC<EmptyStateProps> = ({
  title = "No projects yet",
  description = "Create your first project to get started with Collabute",
  actionLabel = "Create Project",
  actionHref = "/dashboard/wizard",
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="relative w-48 h-48 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-darkPrimary/10 to-transparent rounded-full animate-pulse" />
          <div className="absolute inset-4 bg-gradient-to-br from-darkPrimary/15 to-transparent rounded-full animate-pulse [animation-delay:200ms]" />
          <div className="absolute inset-8 bg-gradient-to-br from-darkPrimary/20 to-transparent rounded-full animate-pulse [animation-delay:400ms]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 backdrop-blur-sm p-6 rounded-full">
              <Layers className="h-16 w-16 text-darkPrimary" />
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="text-gray-400">{description}</p>
        
        <Button 
          asChild
          size="lg"
          className="mt-8 bg-darkPrimary hover:bg-darkPrimary/90 text-white px-8 py-6 h-auto"
        >
          <Link href={actionHref}>
            <PlusCircle className="mr-2 h-5 w-5" />
            {actionLabel}
          </Link>
        </Button>
      </div>
    </div>
  );
}; 