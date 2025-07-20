"use client";
import React from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { useUserData } from "@/hooks/use-user-convex";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useUserData();

  // Show loading state while user data is being fetched
  if (loading || !user) {
    return null; // This will trigger the loading.tsx file
  }

  return (
    <DashboardLayout user={user}>
      {children}
    </DashboardLayout>
  );
}
