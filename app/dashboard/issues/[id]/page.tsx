import { Issue } from "@/types/dashboard";
import axios from "axios";
import { cookies } from "next/headers";
import Sidebar from "@/components/dashboard/Sidebar";
import { getUser } from "@/lib/get-user";
import IssueDetails from "@/components/dashboard/issues/IssueDetails";

async function getIssueDetails(id: string): Promise<Issue> {
  const cookieStore = await cookies();
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
  params: Promise<any>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userId = cookieStore.get("userid")?.value;
  const user = await getUser(userId || "", token || "");
  const issue = await getIssueDetails(id);

  return (
    <div className="flex">
      <Sidebar user={user} />
      <IssueDetails issue={issue} />
    </div>
  );
}
