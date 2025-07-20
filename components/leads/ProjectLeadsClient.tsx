"use client";

import { FC } from "react";
import { User } from "@/types/dashboard";
import { useProjectManagerFilters } from "./hooks/useLeadFilters";
import { ProjectManagerSectionHeader } from "./LeadHeader";
import { ProjectManagerFilterBar } from "./LeadFilterBar";
import { ProjectManagerGrid } from "./LeadGrid";

interface ProjectManagersClientProps {
  projectManagers: User[];
}

/**
 * Client component for the project managers page
 * Manages filters, search, and displaying project managers in two sections
 */
const ProjectManagersClient: FC<ProjectManagersClientProps> = ({
  projectManagers,
}) => {
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
  } = useProjectManagerFilters({
    initialFilters: (() => {
      const initialFilters = {};
      return initialFilters;
    })(),
  });

  // Get top 3 project managers for featured section (highest rated)
  const topRankedProjectManagers = projectManagers
    .sort((a, b) => {
      const ratingA = calculateRating(a);
      const ratingB = calculateRating(b);
      return ratingB - ratingA;
    })
    .slice(0, 3);

  // Helper function to calculate rating (same logic as in ProjectManagerCard)
  function calculateRating(projectManager: User): number {
    const experience = (projectManager as any).leadFields?.experience || 0;
    const projectCount =
      ((projectManager as any).leadFields?.projects?.length || 0) +
      (projectManager.projects?.length || 0);

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
        <ProjectManagerFilterBar
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
        <ProjectManagerSectionHeader title="Top Ranked" />
        <ProjectManagerGrid
          projectManagers={topRankedProjectManagers}
          isLoading={isLoading}
          variant="featured"
        />

        {/* All Project Managers Section */}
        <div className="mt-12">
          <ProjectManagerSectionHeader title="All project managers" />
          <ProjectManagerGrid
            projectManagers={projectManagers}
            isLoading={isLoading}
            variant="compact"
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectManagersClient;
