import { cookies } from "next/headers";
import { getUser } from "@/lib/get-user";
import DashboardContent from "@/components/dashboard/dashboard-content";

const Dashboard = async () => {
  const token = (await cookies()).get("token")?.value;
  const data = await getUser(token || "");
  const user = data?.user;  

  return <DashboardContent user={user} />;
};

export default Dashboard;
