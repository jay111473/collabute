"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Clock,
  TrendingUp,
  Flame,
  Star,
  Grid3X3,
  List,
} from "lucide-react";

interface EnhancedSearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
}

const EnhancedSearchFilterBar = ({
  searchQuery,
  onSearchChange,
  selectedFilters,
  onFilterChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: EnhancedSearchFilterBarProps) => {
  const filterOptions = [
    {
      label: "Trends",
      value: "trends",
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    {
      label: "Popular",
      value: "popular",
      icon: <TrendingUp className="w-3.5 h-3.5" />,
    },
    {
      label: "Urgent",
      value: "urgent",
      icon: <Flame className="w-3.5 h-3.5" />,
    },
    {
      label: "Featured",
      value: "featured",
      icon: <Star className="w-3.5 h-3.5" />,
    },
  ];

  const budgetOptions = [
    { label: "< $500", value: "under_500" },
    { label: "$500 - $1000", value: "500_1000" },
    { label: "$1000 - $5000", value: "1000_5000" },
    { label: "> $5000", value: "over_5000" },
  ];

  const deadlineOptions = [
    { label: "This week", value: "this_week" },
    { label: "This month", value: "this_month" },
    { label: "Next month", value: "next_month" },
    { label: "No deadline", value: "no_deadline" },
  ];

  const techStackOptions = [
    { label: "Next.js", value: "nextjs" },
    { label: "React", value: "react" },
    { label: "Node.js", value: "nodejs" },
    { label: "Python", value: "python" },
  ];

  const sortOptions = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Most Popular", value: "popular" },
    { label: "Budget: High to Low", value: "budget_high" },
    { label: "Budget: Low to High", value: "budget_low" },
  ];

  const handleFilterToggle = (filterValue: string) => {
    const newFilters = selectedFilters.includes(filterValue)
      ? selectedFilters.filter((f) => f !== filterValue)
      : [...selectedFilters, filterValue];
    onFilterChange(newFilters);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <Input
          className="pl-10 pr-3 py-1.5 rounded-md bg-[#1a1a1a] border border-neutral-700 text-sm text-neutral-200 placeholder:text-neutral-500 focus:border-neutral-600"
          placeholder="Search Projects..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex gap-2 w-full justify-between items-center">
        <div className="flex items-center gap-2">
          {filterOptions.map((filter) => (
            <Badge
              key={filter.value}
              className={`flex items-center gap-1 cursor-pointer text-sm px-3 py-1.5 rounded-full border transition-colors ${
                selectedFilters.includes(filter.value)
                  ? "bg-purple-500/20 border-purple-500 text-purple-400"
                  : "bg-[#1a1a1a] border-neutral-700 text-neutral-300 hover:bg-[#2a2a2a]"
              }`}
              onClick={() => handleFilterToggle(filter.value)}
            >
              {filter.icon}
              {filter.label}
            </Badge>
          ))}

          <Select onValueChange={(value) => handleFilterToggle(value)}>
            <SelectTrigger className="px-4 py-0 rounded-full bg-[#1a1a1a] border border-neutral-700 text-neutral-300 text-sm hover:bg-[#2a2a2a]">
              <SelectValue placeholder="< $500" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border border-neutral-700 text-neutral-300">
              {budgetOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => handleFilterToggle(value)}>
            <SelectTrigger className="px-3 py-1.5 rounded-full bg-[#1a1a1a] border border-neutral-700 text-neutral-300 text-sm hover:bg-[#2a2a2a]">
              <SelectValue placeholder="Deadline" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border border-neutral-700 text-neutral-300">
              {deadlineOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => handleFilterToggle(value)}>
            <SelectTrigger className="px-3 py-1.5 rounded-full bg-[#1a1a1a] border border-neutral-700 text-neutral-300 text-sm hover:bg-[#2a2a2a]">
              <SelectValue placeholder="Next.js, +2" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border border-neutral-700 text-neutral-300">
              {techStackOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">Sort:</span>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="px-3 py-1.5 rounded-full bg-[#1a1a1a] border border-neutral-700 text-neutral-300 text-sm hover:bg-[#2a2a2a]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border border-neutral-700 text-neutral-300">
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
    </div>
  );
};

export default EnhancedSearchFilterBar;
