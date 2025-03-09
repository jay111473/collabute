import { FC } from 'react';
import { ClipboardList } from 'lucide-react';

interface EmptyIssuesProps {
  message?: string;
}

/**
 * Empty state component displayed when a user has no issues
 */
export const EmptyIssues: FC<EmptyIssuesProps> = ({
  message = "No issues found. Issues will appear here when you create or are assigned to them."
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-darkPrimary/20 to-darkPrimary/5 flex items-center justify-center mb-4">
        <ClipboardList className="h-8 w-8 text-darkPrimary" />
      </div>
      <p className="text-gray-400 text-center max-w-md">{message}</p>
    </div>
  );
}; 