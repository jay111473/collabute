"use client";

import { Suspense } from "react";

import { VerificationAlerts } from "@/components/dashboard/verification-alerts";
import { useUserData } from "@/hooks/use-user-data";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import DashboardProjects from "@/components/dashboard/dashboard-projects";
import DashboardIssues from "@/components/dashboard/dashboard-issues";

// Skeleton components for progressive loading
const StatsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="bg-darkGray rounded-lg p-4 animate-pulse">
        <div className="h-5 bg-gray-700 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-700 rounded w-16 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-32"></div>
      </div>
    ))}
  </div>
);

const ProjectsSkeleton = () => (
  <div className="bg-darkGray rounded-lg p-6">
    <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-700 rounded"></div>
      ))}
    </div>
  </div>
);

const IssuesSkeleton = () => (
  <div className="bg-darkGray rounded-lg p-6">
    <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-700 rounded"></div>
      ))}
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useUserData();

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      {/* Verification alerts - loads immediately */}
      {user && <VerificationAlerts user={user} />}

      {/* Stats section - streams progressively */}
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Projects and Issues - load in parallel */}
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<ProjectsSkeleton />}>
          <DashboardProjects />
        </Suspense>

        <Suspense fallback={<IssuesSkeleton />}>
          <DashboardIssues />
        </Suspense>
      </div>
    </div>
  );
}
