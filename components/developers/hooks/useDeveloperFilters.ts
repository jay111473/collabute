import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterValues } from "@/types/developer-filters";

interface UseDeveloperFiltersProps {
  initialFilters?: FilterValues;
}

interface UseDeveloperFiltersReturn {
  search: string;
  setSearch: (search: string) => void;
  filters: FilterValues;
  handleFilterChange: (filterId: string) => (value: string) => void;
  sort: string;
  setSort: (sort: string) => void;
  isLoading: boolean;
  hasActiveFilters: boolean;
  resetFilters: () => void;
}

export function useDeveloperFilters({
  initialFilters = {},
}: UseDeveloperFiltersProps): UseDeveloperFiltersReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [search, setSearchState] = useState(searchParams.get("search") || "");
  const [filters, setFilters] = useState<FilterValues>(() => {
    const urlFilters: FilterValues = {};
    searchParams.forEach((value, key) => {
      if (key !== "search" && key !== "sort") {
        urlFilters[key] = value;
      }
    });
    return { ...initialFilters, ...urlFilters };
  });
  const [sort, setSortState] = useState(searchParams.get("sort") || "relevant");
  const [isLoading, setIsLoading] = useState(false);

  // Update URL when filters change
  const updateURL = () => {
    const params = new URLSearchParams();
    
    if (search) params.set("search", search);
    if (sort && sort !== "relevant") params.set("sort", sort);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    const newURL = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    router.push(newURL);
  };

  // Debounced URL update
  useEffect(() => {
    const timer = setTimeout(updateURL, 500);
    return () => clearTimeout(timer);
  }, [search, filters, sort]);

  const setSearch = (newSearch: string) => {
    setSearchState(newSearch);
  };

  const handleFilterChange = (filterId: string) => (value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value || undefined,
    }));
  };

  const setSort = (newSort: string) => {
    setSortState(newSort);
  };

  const hasActiveFilters = Boolean(
    search || 
    Object.values(filters).some(value => value) ||
    (sort && sort !== "relevant")
  );

  const resetFilters = () => {
    setSearchState("");
    setFilters({});
    setSortState("relevant");
    router.push(pathname);
  };

  return {
    search,
    setSearch,
    filters,
    handleFilterChange,
    sort,
    setSort,
    isLoading,
    hasActiveFilters,
    resetFilters,
  };
}