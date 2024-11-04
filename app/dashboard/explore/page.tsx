import React from "react";
import { ExploreComponent } from "@/components/dashboard/projects/explore";
import { getProjects } from "@/lib/get-projects";

const Explore = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const projectsData = await getProjects(page);

  return (
    <div className="">
      <ExploreComponent 
        projects={projectsData.docs}
        pagination={{
          currentPage: projectsData.page,
          totalPages: projectsData.totalPages,
          hasNextPage: projectsData.hasNextPage,
          hasPrevPage: projectsData.hasPrevPage
        }}
      />
    </div>
  );
};

export default Explore;
