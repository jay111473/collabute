"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, TimerIcon } from "lucide-react";

type SearchFilterBarProps = {
  placeholder: string;
  className?: string;
  filters: {
    label: string;
    value: string;
    bgColor?: string;
    borderColor?: string;
    icon?: React.ReactNode;
  }[];
  sortOptions: {
    label: string;
    value: string;
  }[];
  onChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onSortChange: (value: string) => void;
  selectedFilter: string | null;
  selectedSort: string;
};

const SearchFilterBar = ({
  placeholder,
  className,
  filters,
  sortOptions,
  onChange,
  onFilterChange,
  onSortChange,
  selectedFilter,
  selectedSort,
}: SearchFilterBarProps) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        className={cn(
          "flex flex-col justify-start items-start gap-4 w-full",
          className
        )}
      >
        <div className="relative flex-1 flex items-center gap-x-2 px-4 bg-darkGray rounded-[18px] py-3 w-1/2">
          <div className="flex items-center pointer-events-none z-10">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <Input
            className="p-0 text-white placeholder:text-gray-400 placeholder:bg-darkGray border-none outline-none placeholder:border-none focus:border-none focus:bg-darkGray focus:outline-none focus:ring-0 w-full"
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full">
          {filters?.map((filter) => (
            <Badge
              variant="outline"
              key={filter.value}
              className={cn(
                `rounded-full font-medium text-sm cursor-pointer py-3 px-3 flex items-center gap-x-[6px] ${filter.bgColor} ${filter.borderColor} hover:bg-white/10`,
                selectedFilter === filter.value && "border-darkPrimary"
              )}
              onClick={() => onFilterChange(filter.value)}
            >
              {filter.icon}
              {filter.label}
            </Badge>
          ))}
          <Select value={selectedSort} onValueChange={onSortChange}>
            <SelectTrigger className="rounded-full font-medium text-sm cursor-pointer !py-4 px-3 flex items-center gap-x-[6px] w-max">
              <div className="flex items-center gap-2 h-full">
                <TimerIcon className="w-4 h-4" />
                <span className="text-sm">Sort:</span>
                <SelectValue
                  className="text-sm"
                  placeholder="Sort by"
                />
              </div>
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;
