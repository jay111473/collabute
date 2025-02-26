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
      <div className={cn("flex justify-start items-center gap-2", className)}>
        <Input
          className="w-2/5 p-2 text-black placeholder:text-gray-400 rounded-3xl"
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="flex gap-2">
          {filters?.map((filter) => (
            <Badge
              variant="outline"
              key={filter.value}
              className={cn(
                `rounded-3xl font-medium text-xs cursor-pointer py-2 px-3 flex items-center gap-1 ${filter.bgColor} ${filter.borderColor}`,
                selectedFilter === filter.value &&
                  "border-primary text-primary"
              )}
              onClick={() => onFilterChange(filter.value)}
            >
              {filter.icon}
              {filter.label}
            </Badge>
          ))}
        </div>
        <Select value={selectedSort} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px] rounded-3xl">
            <SelectValue placeholder="Sort by" />
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
  );
};

export default SearchFilterBar;
