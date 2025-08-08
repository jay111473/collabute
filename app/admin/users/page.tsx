import { UsersTable } from "@/components/admin/users/users-table";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Users Management</h1>
        <p className="text-gray-400">Manage registered users and their profiles</p>
      </div>
      
      <UsersTable />
    </div>
  );
}