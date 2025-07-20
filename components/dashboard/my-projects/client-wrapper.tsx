"use client";

import MyProjectsComponent from "@/components/dashboard/my-projects";
import { useProjectsConvex } from "@/hooks/use-projects-convex";
import { useUserConvex } from "@/hooks/use-user-convex";

export default function MyProjectsClientWrapper() {
  const { user, loading: userLoading } = useUserConvex();
  const { projects } = useProjectsConvex({
    ownerId: user?._id,
  });

  if (userLoading || !user) {
    return null;
  }

  return <MyProjectsComponent projects={projects} />;
}
