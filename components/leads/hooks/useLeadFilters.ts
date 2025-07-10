import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterValues } from '@/types/filters';

interface UseProjectManagerFiltersProps {
  initialSearch?: string;
  initialFilters?: FilterValues;
  initialSort?: string;
}

interface UseProjectManagerFiltersReturn {
  search: string;
  setSearch: (value: string) => void;
  filters: FilterValues;
  setFilters: React.Dispatch<React.SetStateAction<FilterValues>>;
  sort: string;
  setSort: (value: string) => void;
  isLoading: boolean;
  hasActiveFilters: boolean;
  handleFilterChange: (filterId: string) => (value: string) => void;
  resetFilters: () => void;
}

/**
 * Custom hook to manage project manager filters, search, and sorting
 * Handles URL synchronization and filter state
 */
export const useProjectManagerFilters = ({
  initialSearch = '',
  initialFilters = {},
  initialSort = '',
}: UseProjectManagerFiltersProps = {}): UseProjectManagerFiltersReturn => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL search params or initial values
  const [search, setSearch] = useState(searchParams.get('search') || initialSearch);
  const [filters, setFilters] = useState<FilterValues>(
    Object.keys(initialFilters).length > 0 
      ? initialFilters 
      : (() => {
          const urlFilters: FilterValues = {};
          // We'll populate this from searchParams in the component
          return urlFilters;
        })()
  );
  const [sort, setSort] = useState<string>(searchParams.get('sort') || initialSort);
  const [isLoading, setIsLoading] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = search || Object.values(filters).some(value => value) || sort;

  // Update URL when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateURL();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [filters, sort, search]);

  // Function to update URL with current filters
  const updateURL = () => {
    setIsLoading(true);
    
    // Create a new URLSearchParams object
    const params = new URLSearchParams();
    
    // Add search if present
    if (search) {
      params.set('search', search);
    }
    
    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    // Add sort
    if (sort) {
      params.set('sort', sort);
    }
    
    // Update URL without refreshing the page
    const newURL = `${window.location.pathname}?${params.toString()}`;
    router.push(newURL, { scroll: false });
    
    // Set loading to false after a short delay to show loading state
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  // Handler for filter changes
  const handleFilterChange = (filterId: string) => (value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  };

  // Function to reset all filters
  const resetFilters = () => {
    setSearch('');
    setFilters({});
    setSort('');
    
    // Update URL to remove all query parameters
    router.push(window.location.pathname, { scroll: false });
    
    // Show loading state briefly
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  return {
    search,
    setSearch,
    filters,
    setFilters,
    sort,
    setSort,
    isLoading,
    hasActiveFilters: Boolean(search || Object.keys(filters).length || sort),
    handleFilterChange,
    resetFilters,
  };
};