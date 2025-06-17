import { getUser } from "@/lib/get-user";
import DashboardContent from "@/components/dashboard/dashboard-content";
import { redirect } from "next/navigation";
import { getRecentProjects } from "@/lib/get-recent-projects";

export const dynamic = "force-dynamic";

const Dashboard = async () => {
  const data = await getUser();
  const recentProjects = await getRecentProjects(data?.id);
  const user = data;
  if (!user) {
    redirect("/auth");
  }

  return <DashboardContent user={user} />;
};

export default Dashboard;
