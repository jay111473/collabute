import React from "react";
import { ExploreComponent } from "@/components/dashboard/projects/explore";
import { getProjects } from "@/lib/get-projects";
import { getUser } from "@/lib/get-user";
import { cookies } from "next/headers";
import Sidebar from "@/components/dashboard/Sidebar";
const Explore = async ({
  searchParams,
}: {
  searchParams: Promise<any>;
}) => {
  const { page } = await searchParams;
  const projectsData = await getProjects(page);
  const token = (await cookies()).get("token")?.value;
  const userId = (await cookies()).get("userid")?.value;
  const user = await getUser(userId || "", token || "");

  return (
    <div className="flex">
      <Sidebar user={user} />
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
