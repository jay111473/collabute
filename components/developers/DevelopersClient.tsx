"use client";

import { FC } from "react";
import { User } from "@/types/dashboard";
import { useDeveloperFilters } from "./hooks/useDeveloperFilters";
import { DeveloperSectionHeader } from "./DevelopersHeader";
import { DeveloperFilterBar } from "./DevelopersFilterBar";
import { DeveloperGrid } from "./DevelopersGrid";

interface DevelopersClientProps {
  developers: User[];
}

/**
 * Client component for the developers page
 * Manages filters, search, and displaying developers in two sections
 */
const DevelopersClient: FC<DevelopersClientProps> = ({ developers }) => {
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
  } = useDeveloperFilters({
    initialFilters: (() => {
      const initialFilters = {};
      return initialFilters;
    })(),
  });

  // Get top 3 developers for featured section (highest rated)
  const topRankedDevelopers = developers
    .sort((a, b) => {
      const ratingA = calculateRating(a);
      const ratingB = calculateRating(b);
      return ratingB - ratingA;
    })
    .slice(0, 3);

  // Helper function to calculate rating (same logic as in DeveloperCard)
  function calculateRating(developer: User): number {
    const experience = developer.leadFields?.experience || 0;
    const projectCount = developer.developerFields?.issues?.length || 0;

    let rating = 3.5;

    if (experience >= 8) rating += 1.0;
    else if (experience >= 5) rating += 0.7;
    else if (experience >= 3) rating += 0.4;

    if (projectCount >= 10) rating += 0.4;
    else if (projectCount >= 5) rating += 0.2;

    return Math.min(5.0, Math.round(rating * 10) / 10);
  }

  return (
    <div className="flex-1">
      <div className="p-6">
        {/* Filters */}
        <DeveloperFilterBar
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
        <DeveloperSectionHeader title="Top Ranked" />
        <DeveloperGrid
          developers={topRankedDevelopers}
          isLoading={isLoading}
          variant="featured"
        />

        {/* All Developers Section */}
        <div className="mt-12">
          <DeveloperSectionHeader title="Smart Match" />
          <DeveloperGrid
            developers={developers}
            isLoading={isLoading}
            variant="compact"
          />
        </div>
      </div>
    </div>
  );
};

export default DevelopersClient;
