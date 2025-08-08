"use client";
import React, { useEffect } from "react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { useUserConvex } from "@/hooks/use-user-convex";

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

      {/* <Unauthenticated>
        <UnauthenticatedRedirect />
      </Unauthenticated> */}

      <Authenticated>
        <DashboardContent>{children}</DashboardContent>
      </Authenticated>
    </>
  );
}

function UnauthenticatedRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-white">Redirecting to login...</div>
    </div>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUserConvex();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user found, redirect to auth
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Show loading state while user data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Loading user data...</div>
      </div>
    );
  }

  // If no user after loading, show loading while redirect happens
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Redirecting...</div>
      </div>
    );
  }

  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
