import React from "react";
import { ExploreComponent } from "@/components/dashboard/projects/explore";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export const dynamic = "force-dynamic";

const Explore = async ({ searchParams }: { searchParams: Promise<any> }) => {
  const { page } = await searchParams;

  const preloaded = await preloadQuery(api.projects.getProjects, {
    limit: 10,
    page: page || 1,
  });

  const projectsData = (preloaded._valueJSON as any) || {
    projects: [],
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
  };

  return (
    <ExploreComponent
      projects={projectsData.projects}
      pagination={{
        currentPage: projectsData.currentPage,
        totalPages: projectsData.totalPages,
        hasNextPage: projectsData.hasMore,
        hasPrevPage: projectsData.currentPage > 1,
      }}
    />
  );
};

export default Explore;
