"use client";

import { DollarSign, ArrowLeftRight, GitPullRequest } from "lucide-react";
import { useUserConvex } from "@/hooks/use-user-convex";
import DashboardCard from "@/components/uikit/dashboard-card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DashboardStats() {
  const { user } = useUserConvex();
  const dashboardStats = useQuery(api.dashboardStats.getDashboardStats);

  if (!user) return null;

  // Default values while loading
  const stats = dashboardStats || {
    issuesCount: 0,
    projectsCount: 0,
    totalPayments: 0,
    wallet: user?.wallet || 0,
  };

  if (user?.type === "DEVELOPER" || user?.type === "PROJECT_MANAGER") {
    return (
      <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        <DashboardCard
          title="Issues"
          value={stats.issuesCount}
          icon={GitPullRequest}
          subtext="+180.1% from last month"
        />
        <DashboardCard
          title="Balance"
          value={`$${stats.wallet}`}
          icon={DollarSign}
          subtext="+19% from last month"
        />
        <DashboardCard
          title="Total Payments"
          value={`$${stats.totalPayments.toFixed(2)}`}
          icon={ArrowLeftRight}
          subtext="+20.1% from last month"
        />
      </div>
    );
  }

  if (user.type === "STARTUP" || user.type === "LEAD") {
    return (
      <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-2">
        <DashboardCard
          title="Total Projects"
          value={stats.projectsCount}
          icon={GitPullRequest}
          subtext="+180.1% from last month"
        />
        <DashboardCard
          title="Balance"
          value={`$${stats.wallet}`}
          icon={DollarSign}
          subtext="+19% from last month"
        />
      </div>
    );
  }

  return null;
}
