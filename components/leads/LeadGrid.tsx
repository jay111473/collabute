import { FC } from 'react';
import LeadCard from './LeadCard';
import { User } from '@/types/dashboard';

interface LeadGridProps {
  leads: User[];
  isLoading: boolean;
}

/**
 * Grid component to display lead cards
 * Handles loading states and empty states
 */
export const LeadGrid: FC<LeadGridProps> = ({ leads, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-darkGray border-none p-8 rounded-2xl animate-pulse">
            <div className="flex items-start gap-4 mb-8">
              <div className="h-16 w-16 rounded-full bg-[#222]" />
              <div>
                <div className="h-6 w-40 bg-[#222] mb-2 rounded-md" />
                <div className="h-6 w-56 bg-[#222] rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="col-span-2 text-center py-10">
        <p className="text-gray-400">No leads found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}; 