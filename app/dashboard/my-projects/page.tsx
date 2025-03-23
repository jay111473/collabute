import MyProjectsComponent from "@/components/dashboard/my-projects";
import { getUser } from "@/lib/get-user";
import { Issue, Project } from "@/types/dashboard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import Sidebar from "@/components/dashboard/Sidebar";

const MyProjects = async () => {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    redirect("/auth");
  }

  const data = await getUser(token || "");
  const user = data?.user;
  return (
    <div className="flex">
      <Sidebar user={user} />
      <MyProjectsComponent
        projects={user?.projects as Project[]}
        issues={user?.developerFields?.issues as Issue[]}
      />
    </div>
  );
};

export default MyProjects;
