"use client";

import SearchFilterBar from "@/components/dashboard/project/search-filter-bar";
import { Project, ProjectType } from "@/types/dashboard";
import { useState, useMemo } from "react";
import { ProjectCard } from "./project-card";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { FolderOpen } from "lucide-react";

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
  { label: "Normal", value: "normal" },
  { label: "Urgent", value: "urgent" },
  { label: "Featured", value: "featured" },
  { label: "Trending", value: "trending" },
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
  const [selectedType, setSelectedType] = useState<ProjectType | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const filteredAndSortedProjects = useMemo(() => {
    let filtered =
      projects?.filter((project) => {
        const matchesSearch =
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType
          ? project.projectType === selectedType
          : true;
        return matchesSearch && matchesType;
      }) || [];

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
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

  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, pagination.currentPage - halfVisible);
    let endPage = Math.min(
      pagination.totalPages,
      startPage + maxVisiblePages - 1
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page
    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // Add pages
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <PaginationItem key={page}>
          <PaginationLink
            isActive={page === pagination.currentPage}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add last page
    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={pagination.totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(pagination.totalPages)}
          >
            {pagination.totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="flex flex-col gap-3">
      <SearchFilterBar
        placeholder="Search projects..."
        filters={projectTypeFilters}
        sortOptions={sortOptions}
        onChange={setSearchQuery}
        onFilterChange={(value) => setSelectedType(value as ProjectType)}
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
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    className={
                      !pagination.hasPrevPage
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>

                {generatePaginationItems()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    className={
                      !pagination.hasNextPage
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};
