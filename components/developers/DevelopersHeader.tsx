import { FC } from 'react';
import { Search, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DeveloperHeaderProps {
  title: string;
}

/**
 * Header component for the developers page
 */
export const DeveloperHeader: FC<DeveloperHeaderProps> = ({ title }) => {
  return (
    <div className="flex items-center justify-between border-b border-grayBorders px-6 py-4">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-[#222] transition-colors">
          <Search className="h-5 w-5 text-gray-400" />
        </button>
        <button className="p-2 rounded-full hover:bg-[#222] transition-colors">
          <Bell className="h-5 w-5 text-gray-400" />
        </button>
        <Avatar className="h-8 w-8">
          <AvatarImage src="" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

/**
 * Section header component for the developers page
 */
export const DeveloperSectionHeader: FC<DeveloperHeaderProps> = ({ title }) => {
  return (
    <div className="flex items-center justify-between mb-6 mt-4">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="flex gap-2">
        <button className="p-1 rounded-lg hover:bg-[#222] transition-colors">
          <ChevronLeft className="h-5 w-5 text-gray-400" />
        </button>
        <button className="p-1 rounded-lg hover:bg-[#222] transition-colors">
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
};