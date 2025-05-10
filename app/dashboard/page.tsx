import { getUser } from "@/lib/get-user";
import DashboardContent from "@/components/dashboard/dashboard-content";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const Dashboard = async () => {
  const data = await getUser();
  const user = data;
  if (!user) {
    redirect("/auth");
  }

  return <DashboardContent user={user} />;
};

export default Dashboard;
