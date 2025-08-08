import { IssuesTable } from "@/components/admin/issues/issues-table";

export default function AdminIssuesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Issues Management</h1>
        <p className="text-gray-400">Manage project issues and assignments</p>
      </div>
      
      <IssuesTable />
    </div>
  );
}