import React from "react";
import { ExploreComponent } from "@/components/dashboard/projects/explore";
import { getProjects } from "@/lib/get-projects";

const Explore = async () => {
  const { docs } = await getProjects(1);

  return (
    <div className="">
      <ExploreComponent projects={docs} />
    </div>
  );
};

export default Explore;
