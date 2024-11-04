"use client";

import SearchFilterBar from "@/components/dashboard/project/search-filter-bar";
import { Project, ProjectType } from "@/types/dashboard";
import { useState, useMemo } from "react";
import { ProjectCard } from "./project-card";

interface ExploreComponentProps {
  projects: Project[];
}

const projectTypeFilters = [
  { label: 'Normal', value: 'normal' },
  { label: 'Urgent', value: 'urgent' },
  { label: 'Featured', value: 'featured' },
  { label: 'Trending', value: 'trending' },
];

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Most Related', value: 'related' },
];

type SortOption = 'newest' | 'oldest' | 'related';

export const ExploreComponent = ({ projects }: ExploreComponentProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<ProjectType | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      // Search filter
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Project type filter
      const matchesType = selectedType ? project.projectType === selectedType : true;

      return matchesSearch && matchesType;
    });

    // Sort projects
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'oldest':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'related':
          // Add your related sorting logic here
          return 0;
        default:
          return 0;
      }
    });
  }, [projects, searchQuery, selectedType, sortBy]);

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
      <div className="grid gap-4">
        {filteredAndSortedProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};
