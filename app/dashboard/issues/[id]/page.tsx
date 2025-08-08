import IssueDetails from "@/components/dashboard/issues/IssueDetails";

export default async function IssueDetailsPage({
  params,
}: {
  params: Promise<any>;
}) {
  const { id } = await params;

  return <IssueDetails issueId={id} />;
}
