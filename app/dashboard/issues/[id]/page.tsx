import { Issue } from "@/types/dashboard";
import axios from "axios";
import { cookies } from "next/headers";
import IssueDetails from "./components/IssueDetails";
import Sidebar from "@/components/dashboard/Sidebar";
import { getUser } from "@/lib/get-user";

async function getIssueDetails(id: string): Promise<Issue> {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/issues/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

export default async function IssueDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const userId = cookieStore.get("userid")?.value;
  const user = await getUser(userId || "", token || "");
  const issue = await getIssueDetails(params.id);

  return (
    <div className="flex">
      <Sidebar user={user} />
      <IssueDetails issue={issue} />
    </div>
  );
}
