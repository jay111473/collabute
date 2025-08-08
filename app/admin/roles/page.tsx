"use client";

import { RolesTable } from "@/components/admin/roles/roles-table";

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Roles Management</h1>
        <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
      </div>
      
      <RolesTable />
    </div>
  );
}