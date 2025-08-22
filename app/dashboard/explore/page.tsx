import React from "react";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import ExplorePage from "@/components/dashboard/explore/ExplorePage";

export const dynamic = "force-dynamic";

const Explore = async ({ searchParams }: { searchParams: Promise<any> }) => {
  const { page } = await searchParams;

  const preloaded = await preloadQuery(api.projects.getExplorePageData, {
    limit: 10,
    page: page ? parseInt(page) : 1,
  });

  const exploreData = (preloaded._valueJSON as any) || {
    typeCounts: {
      "Back-end": 0,
      "Front-end": 0,
      "QA / Test": 0,
      Deployment: 0,
      Design: 0,
    },
    featuredProjects: [],
    allProjects: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalProjects: 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 10,
    },
  };

  return <ExplorePage initialData={exploreData} />;
};

export default Explore;
