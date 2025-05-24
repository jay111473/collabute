import MyProjectsComponent from "@/components/dashboard/my-projects";
import { getUser } from "@/lib/get-user";
import { Issue, Project } from "@/types/dashboard";
import { redirect } from "next/navigation";
import React from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

export const dynamic = "force-dynamic";

const MyProjects = async () => {
  const user = await getUser(2);
  if (!user) {
    redirect("/auth");
  }
  return (
    <DashboardLayout user={user} title="My Projects">
      <MyProjectsComponent
        projects={user?.projects as Project[]}
        issues={user?.developerFields?.issues as Issue[]}
        currentUser={user}
      />
    </DashboardLayout>
  );
};

export default MyProjects;
