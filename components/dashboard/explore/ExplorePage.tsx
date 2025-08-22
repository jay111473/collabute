"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ProjectTypeCounts from "./ProjectTypeCounts";
import FeaturedProjects from "./FeaturedProjects";
import EnhancedSearchFilterBar from "./EnhancedSearchFilterBar";
import ProjectListItem from "./ProjectListItem";
import { EnhancedProject, ExplorePageData } from "@/types/convex";
import { Grid3X3, List } from "lucide-react";
import { CustomPagination } from "@/components/dashboard/projects/custom-pagination";
import { useRouter, useSearchParams } from "next/navigation";

interface ExplorePageProps {
  initialData: ExplorePageData;
}

const ExplorePage = ({ initialData }: ExplorePageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");


  const currentPage = parseInt(searchParams.get("page") || "1");

  const exploreData = useQuery(api.projects.getExplorePageData, {
    limit: 10,
    page: currentPage,
  }) as ExplorePageData | undefined;

  // Use initialData if query is still loading, otherwise use query result
  const data = exploreData || initialData;
  console.log(data);

  const filteredAndSortedProjects = useMemo(() => {
    if (!data?.allProjects) return [];

    let filtered = data.allProjects.filter((project) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType =
        selectedFilters.length === 0 ||
        selectedFilters.some((filter) => {
          if (filter === "trends")
            return project.type === "ai_ml" || project.type === "mobile";
          if (filter === "popular") return (project.issueCount || 0) > 10;
          if (filter === "urgent")
            return (
              project.deadlineText?.includes("Overdue") ||
              project.deadlineText?.includes("Due today")
            );
          if (filter === "featured") return project.type === "ai_ml";
          if (filter === "under_500") return (project.budget || 0) < 500;
          if (filter === "500_1000")
            return (project.budget || 0) >= 500 && (project.budget || 0) < 1000;
          if (filter === "1000_5000")
            return (
              (project.budget || 0) >= 1000 && (project.budget || 0) < 5000
            );
          if (filter === "over_5000") return (project.budget || 0) >= 5000;
          if (filter === "this_week")
            return (
              project.deadlineText?.includes("days") &&
              parseInt(project.deadlineText) <= 7
            );
          if (filter === "this_month")
            return (
              project.deadlineText?.includes("weeks") &&
              parseInt(project.deadlineText) <= 4
            );
          if (filter === "next_month")
            return (
              project.deadlineText?.includes("weeks") &&
              parseInt(project.deadlineText) > 4
            );
          if (filter === "no_deadline")
            return project.deadlineText === "No deadline";
          if (
            filter === "nextjs" ||
            filter === "react" ||
            filter === "nodejs" ||
            filter === "python"
          ) {
            return project.stacks?.some((stack) =>
              stack.toLowerCase().includes(filter.toLowerCase())
            );
          }
          return false;
        });

      return matchesSearch && matchesType;
    });

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt || "").getTime() -
            new Date(b.createdAt || "").getTime()
          );
        case "popular":
          return (b.issueCount || 0) - (a.issueCount || 0);
        case "budget_high":
          return (b.budget || 0) - (a.budget || 0);
        case "budget_low":
          return (a.budget || 0) - (b.budget || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [data?.allProjects, searchQuery, selectedFilters, sortBy]);

  const handlePageChange = (newPage: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("page", newPage.toString());
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`/dashboard/explore${query}`);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full bg-black min-h-screen">
      <ProjectTypeCounts typeCounts={data.typeCounts} />

      <FeaturedProjects
        featuredProjects={data.featuredProjects as EnhancedProject[]}
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">All projects</h2>
          <div className="flex items-center gap-1 bg-[#1a1a1a] border border-neutral-700 rounded-md p-1">
            <button
              className={`p-1.5 rounded-md ${
                viewMode === "list"
                  ? "bg-[#2a2a2a] text-white"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              className={`p-1.5 rounded-md ${
                viewMode === "grid"
                  ? "bg-[#2a2a2a] text-white"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <EnhancedSearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedFilters={selectedFilters}
          onFilterChange={setSelectedFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {filteredAndSortedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium">No projects found</p>
            <p className="text-sm">
              Try adjusting your search criteria or filters
            </p>
          </div>
        ) : (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "flex flex-col gap-4"
              }
            >
              {filteredAndSortedProjects.map((project) => (
                <ProjectListItem
                  key={project._id}
                  project={project}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination && data.pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <CustomPagination
                  currentPage={data.pagination.currentPage}
                  totalPages={data.pagination.totalPages}
                  hasNextPage={data.pagination.hasNextPage}
                  hasPrevPage={data.pagination.hasPrevPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
