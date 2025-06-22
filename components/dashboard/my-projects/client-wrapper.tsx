"use client";

import MyProjectsComponent from "@/components/dashboard/my-projects";
import { useProjectsData } from "@/hooks/use-projects-data";
import { useUserData } from "@/hooks/use-user-data";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

export default function MyProjectsClientWrapper() {
  const { user, loading: userLoading } = useUserData();
  console.log(user);
  const { projects } = useProjectsData({
    where: user?.id ? { owner: { equals: user.id.toString() } } : {},
  });

  if (userLoading || !user) {
    return null; // Loading will be handled by loading.tsx
  }

  return (
    <>
      <MyProjectsComponent projects={projects} />
    </>
  );
}
