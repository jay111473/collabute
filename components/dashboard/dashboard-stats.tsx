"use client";

import { DollarSign, ArrowLeftRight, GitPullRequest } from "lucide-react";
import DashboardCard from "@/components/uikit/dashboard-card";
import { useUserConvex } from "@/hooks/use-user-convex";

export default function DashboardStats() {
  const { user } = useUserConvex();
  console.log("DashboardStats user:", user);
  if (!user) return null;

  if (user?.type === "DEVELOPER" || user?.type === "PROJECT_MANAGER") {
    return (
      <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        <DashboardCard
          title="Issues"
          value={0} // TODO: Fetch issues from Convex
          icon={GitPullRequest}
          subtext="+180.1% from last month"
        />
        <DashboardCard
          title="Balance"
          value={`$${user?.wallet || 0}`}
          icon={DollarSign}
          subtext="+19% from last month"
        />
        <DashboardCard
          title="Total Payments"
          value={`$0`} // TODO: Fetch from developer profile
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
          value={0} // TODO: Fetch user's projects from Convex
          icon={GitPullRequest}
          subtext="+180.1% from last month"
        />
        <DashboardCard
          title="Balance"
          value={`$${user?.wallet || 0}`}
          icon={DollarSign}
          subtext="+19% from last month"
        />
      </div>
    );
  }

  return null;
}
