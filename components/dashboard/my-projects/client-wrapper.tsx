"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import MyProjectsComponent from "@/components/dashboard/my-projects";
import { useUserConvex } from "@/hooks/use-user-convex";

export default function MyProjectsClientWrapper() {
  const { user, loading: userLoading } = useUserConvex();
  const projects = useQuery(
    api.projects.getAllProjects,
    user?._id ? { ownerId: user._id } : "skip"
  );

  if (userLoading || !user) {
    return null;
  }

  return <MyProjectsComponent projects={projects || []} />;
}
