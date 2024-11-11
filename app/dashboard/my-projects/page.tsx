import MyProjectsComponent from "@/components/dashboard/my-projects";
import { getUser } from "@/lib/get-user";
import { Issue, Project } from "@/types/dashboard";
import { cookies } from "next/headers";
import React from "react";

const MyProjects = async () => {
  const token = (await cookies()).get("token")?.value;
  const userId = (await cookies()).get("userid")?.value;

  if (!token || !userId) {
    window.location.href = "/auth/login";
  }

  const user = await getUser(userId || "", token || "");
  return (
    <div>
      <MyProjectsComponent
        projects={user?.projects as Project[]}
        issues={user?.developerFields?.issues as Issue[]}
      />
    </div>
  );
};

export default MyProjects;
