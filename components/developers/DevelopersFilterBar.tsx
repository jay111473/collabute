import { FC } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "../leads/FilterSelect";
import { DEVELOPER_FILTERS, FilterValues, DEVELOPER_SORT_OPTIONS } from "@/types/developer-filters";

interface DeveloperFilterBarProps {
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
 * Filter bar component for developers page
 * Includes search, filters, sort, and reset functionality
 */
export const DeveloperFilterBar: FC<DeveloperFilterBarProps> = ({
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
          placeholder="Search for a CTO by skills, industry, or location."
          className="pl-10 bg-darkGray border-grayBorders text-white rounded-[18px] h-11 placeholder:text-grayText"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          {DEVELOPER_FILTERS.map((filter) => (
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
        <div>
          <FilterSelect
            filter={{
              placeholder: "Sort: Relevant",
              options: DEVELOPER_SORT_OPTIONS,
            }}
            value={sort}
            onChange={onSortChange}
          />
        </div>
      </div>
    </div>
  );
};