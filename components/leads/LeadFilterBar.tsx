import { FC } from 'react';
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "./FilterSelect";
import { FILTERS, FilterValues, SORT_OPTIONS } from "@/types/filters";

interface ProjectManagerFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: FilterValues;
  onFilterChange: (filterId: string) => (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

/**
 * Filter bar component for project managers page
 * Includes search, filters, sort, and reset functionality
 */
export const ProjectManagerFilterBar: FC<ProjectManagerFilterBarProps> = ({
  search,
  onSearchChange,
  filters,
  onFilterChange,
  sort,
  onSortChange,
  hasActiveFilters,
  onResetFilters,
}) => {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search for a project manager by name or stack"
          className="pl-10 bg-black border-grayBorders text-white rounded-lg h-11 placeholder:text-grayText"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {FILTERS.map((filter) => (
            <FilterSelect
              key={filter.id}
              filter={filter}
              value={filters[filter.id]}
              onChange={onFilterChange(filter.id)}
            />
          ))}
          
          {/* Reset button - only show when filters are active */}
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={onResetFilters}
              className="h-11 px-4 bg-black border border-grayBorders text-white hover:bg-[#222] hover:text-white rounded-lg flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              <span className="text-sm">Reset</span>
            </Button>
          )}
        </div>

        <FilterSelect
          filter={{
            placeholder: "Sort By",
            options: SORT_OPTIONS,
          }}
          value={sort}
          onChange={onSortChange}
        />
      </div>
    </div>
  );
}; 