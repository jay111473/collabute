import { ProjectsTable } from "@/components/admin/projects/projects-table";

export default function AdminProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Projects Management</h1>
        <p className="text-gray-600">Manage projects and their collaborators</p>
      </div>
      
      <ProjectsTable />
    </div>
  );
}