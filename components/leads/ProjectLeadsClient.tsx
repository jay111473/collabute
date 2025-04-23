"use client";

import { FC } from "react";
import { User } from "@/types/dashboard";
import { useLeadFilters } from "./hooks/useLeadFilters";
import { LeadSectionHeader } from "./LeadHeader";
import { LeadFilterBar } from "./LeadFilterBar";
import { LeadGrid } from "./LeadGrid";

interface ProjectLeadsClientProps {
  leads: User[];
}

/**
 * Client component for the leads page
 * Manages filters, search, and displaying leads
 */
const ProjectLeadsClient: FC<ProjectLeadsClientProps> = ({ leads }) => {
  // Initialize filters from URL search params
  const {
    search,
    setSearch,
    filters,
    handleFilterChange,
    sort,
    setSort,
    isLoading,
    hasActiveFilters,
    resetFilters,
  } = useLeadFilters({
    initialFilters: (() => {
      const initialFilters = {};
      return initialFilters;
    })(),
  });

  return (
    <div className="flex-1">
      <div className="p-6">
        {/* Filters */}
        <LeadFilterBar
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFilterChange={handleFilterChange}
          sort={sort}
          onSortChange={setSort}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
        />

        {/* Top Ranked Section */}
        <LeadSectionHeader title="Top Ranked" />

        {/* Cards Grid */}
        <LeadGrid leads={leads} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ProjectLeadsClient;
