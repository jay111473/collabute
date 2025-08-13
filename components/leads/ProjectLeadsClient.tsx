"use client";

import { FC, useEffect, useState } from "react";
import { User } from "@/types/convex";
import { useProjectManagerFilters } from "./hooks/useLeadFilters";
import { ProjectManagerSectionHeader } from "./LeadHeader";
import { ProjectManagerFilterBar } from "./LeadFilterBar";
import { ProjectManagerGrid } from "./LeadGrid";
import TeamLeadCard from "./TeamLeadCard";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface ProjectManagersClientProps {
  projectManagers: User[];
  teamLeadId: string | undefined;
}

/**
 * Client component for the project managers page
 * Manages filters, search, and displaying project managers in two sections
 */
const ProjectManagersClient: FC<ProjectManagersClientProps> = ({
  projectManagers,
  teamLeadId,
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

  const router = useRouter();

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

  function handleClose() {
    const params = new URLSearchParams();
    params.delete("Id");
    const newParams = params.toString() ? `?${params.toString()}` : "";
    router.push(`/dashboard/leads${newParams}`);
  }

  const [teamLeadData, setTeamLeadData] = useState<User | undefined>(undefined);

  useEffect(() => {
    if (teamLeadId) {
      const teamLead = projectManagers.find((pm) => pm._id === teamLeadId);
      setTeamLeadData(teamLead);
    } else {
      setTeamLeadData(undefined);
    }
  }, [teamLeadId]);

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-xs",
            teamLeadData ? "text-gray-500" : "text-white"
          )}
        >
          Explore projects leads{" "}
          {teamLeadData && (
            <>
              /
              <span className="text-xs text-white ml-1.5">
                {teamLeadData.name}
              </span>
            </>
          )}
        </span>

        {teamLeadData && (
          <Button
            onClick={handleClose}
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {teamLeadData ? (
        <div className="mt-6">
          <TeamLeadCard teamLead={teamLeadData} />
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default ProjectManagersClient;
