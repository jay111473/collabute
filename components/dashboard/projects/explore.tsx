"use client";

import SearchFilterBar from "@/components/dashboard/project/search-filter-bar";
import { Project } from "@/types/convex";
import { useState, useMemo } from "react";
import { ProjectCard } from "./project-card";
import { useRouter, useSearchParams } from "next/navigation";
import { Flame, FolderOpen, Star, TimerReset, TrendingUp } from "lucide-react";
import { CustomPagination } from "./custom-pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ExploreComponentProps {
  projects: Project[];
  pagination: PaginationProps;
}

const projectTypeFilters = [
  {
    label: "Normal",
    value: "normal",
    bgColor: "",
    borderColor: "border-grayBorders",
    icon: <TimerReset size={16} />,
  },
  {
    label: "Urgent",
    value: "urgent",
    bgColor: "",
    borderColor: "border-grayBorders",
    icon: <Flame size={16} />,
  },
  {
    label: "Featured",
    value: "featured",
    bgColor: "",
    borderColor: "border-grayBorders",
    icon: <Star size={16} />,
  },
  {
    label: "Trending",
    value: "trending",
    bgColor: "",
    borderColor: "border-grayBorders",
    icon: <TrendingUp size={16} />,
  },
];

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Most Related", value: "related" },
];

type SortOption = "newest" | "oldest" | "related";

export const ExploreComponent = ({
  projects,
  pagination,
}: ExploreComponentProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const filteredAndSortedProjects = useMemo(() => {
    let filtered =
      projects?.filter((project) => {
        const matchesSearch =
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType ? project.type === selectedType : true;
        return matchesSearch && matchesType;
      }) || [];

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b._creationTime).getTime() -
            new Date(a._creationTime).getTime()
          );
        case "oldest":
          return (
            new Date(a._creationTime).getTime() -
            new Date(b._creationTime).getTime()
          );
        case "related":
          return 0;
        default:
          return 0;
      }
    });
  }, [projects, searchQuery, selectedType, sortBy]);

  const handlePageChange = (newPage: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("page", newPage.toString());
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`/dashboard/explore${query}`);
  };

  return (
    <div className="flex flex-col gap-3 p-6 w-full bg-black">
      <SearchFilterBar
        placeholder="Search projects..."
        filters={projectTypeFilters}
        sortOptions={sortOptions}
        onChange={setSearchQuery}
        onFilterChange={(value) => setSelectedType(value as string)}
        onSortChange={(value) => setSortBy(value as SortOption)}
        selectedFilter={selectedType}
        selectedSort={sortBy}
      />

      {!projects || projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
          <FolderOpen className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium">No projects to show</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      ) : filteredAndSortedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
          <FolderOpen className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium">No matching projects found</p>
          <p className="text-sm">
            Try adjusting your search criteria or filters
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {filteredAndSortedProjects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>

          <CustomPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};
