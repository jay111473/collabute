"use client";

import { DollarSign, ArrowLeftRight, GitPullRequest } from "lucide-react";
import DashboardCard from "@/components/uikit/dashboard-card";
import { useUserData } from "@/hooks/use-user-data";

export default function DashboardStats() {
  const { user } = useUserData();

  if (!user) return null;

  if (user.type === "developer") {
    return (
      <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        <DashboardCard
          title="Issues"
          value={user.developerFields?.issues?.length || 0}
          icon={GitPullRequest}
          subtext="+180.1% from last month"
        />
        <DashboardCard
          title="Balance"
          value={`$${user.wallet}`}
          icon={DollarSign}
          subtext="+19% from last month"
        />
        <DashboardCard
          title="Total Payments"
          value={`$${user.developerFields?.totalPayment || 0}`}
          icon={ArrowLeftRight}
          subtext="+20.1% from last month"
        />
      </div>
    );
  }

  if (user.type === "startup") {
    return (
      <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-2">
        <DashboardCard
          title="Total Projects"
          value={user?.projects?.length || 0}
          icon={GitPullRequest}
          subtext="+180.1% from last month"
        />
        <DashboardCard
          title="Balance"
          value={`$${user.wallet}`}
          icon={DollarSign}
          subtext="+19% from last month"
        />
      </div>
    );
  }

  return null;
}
