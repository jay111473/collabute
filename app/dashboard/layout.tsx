"use client";
import React, { useEffect } from "react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { useUserData } from "@/hooks/use-user-convex";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AuthLoading>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="text-white">Loading...</div>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <UnauthenticatedRedirect />
      </Unauthenticated>

      <Authenticated>
        <DashboardContent>{children}</DashboardContent>
      </Authenticated>
    </>
  );
}

function UnauthenticatedRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/auth");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-white">Redirecting to login...</div>
    </div>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUserData();

  // Show loading state while user data is being fetched
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Loading user data...</div>
      </div>
    );
  }

  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
