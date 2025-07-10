import React from "react";
import { ExploreComponent } from "@/components/dashboard/projects/explore";
import { getProjects } from "@/lib/get-projects";
import { getUser } from "@/lib/get-user";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const Explore = async ({ searchParams }: { searchParams: Promise<any> }) => {
  const { page } = await searchParams;
  const projectsData = await getProjects(page);
  const user = await getUser(2);
  if (!user) {
    redirect("/auth");
  }
  return (
    <ExploreComponent
      projects={projectsData.docs}
      pagination={{
        currentPage: projectsData.page,
        totalPages: projectsData.totalPages,
        hasNextPage: projectsData.hasNextPage,
        hasPrevPage: projectsData.hasPrevPage,
      }}
    />
  );
};

export default Explore;
