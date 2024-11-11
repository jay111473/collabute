import MyProjectsComponent from "@/components/dashboard/my-projects";
import { getProjects } from "@/lib/get-projects";
import { cookies } from "next/headers";
import React from "react";

const MyProjects = async () => {
  const token = (await cookies()).get("token")?.value;
  const userId = (await cookies()).get("userid")?.value;

  if (!token || !userId) {
    window.location.href = "/auth/login";
  }

  const { docs: projects } = await getProjects(1, 5);
  return (
    <div>
      <MyProjectsComponent projects={projects} />
    </div>
  );
};

export default MyProjects;
