"use client";

import { MediaTable } from "@/components/admin/media/media-table";

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Media Management</h1>
        <p className="text-gray-600 mt-1">Manage uploaded files and media assets</p>
      </div>
      
      <MediaTable />
    </div>
  );
}