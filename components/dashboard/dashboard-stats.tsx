"use client";

import { DollarSign, ArrowLeftRight, GitPullRequest } from "lucide-react";
import DashboardCard from "@/components/uikit/dashboard-card";
import { useUserConvex } from "@/hooks/use-user-convex";

export default function DashboardStats() {
  const { user } = useUserConvex();
  console.log("DashboardStats user:", user);
  if (!user) return null;

  if (user?.type === "DEVELOPER") {
    return (
      <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        <DashboardCard
          title="Issues"
          value={(user as any).developerFields?.issues?.length || 0}
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
          value={`$${(user as any).developerFields?.totalPayment || 0}`}
          icon={ArrowLeftRight}
          subtext="+20.1% from last month"
        />
      </div>
    );
  }

  if (user.type === "STARTUP") {
    return (
      <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-2">
        <DashboardCard
          title="Total Projects"
          value={(user as any)?.projects?.length || 0}
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
