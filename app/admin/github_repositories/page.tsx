"use client";

import { GitHubReposTable } from "@/components/admin/github_repositories/github-repos-table";

export default function GitHubReposPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          GitHub Repositories
        </h1>
        <p className="text-gray-600 mt-1">
          Manage connected GitHub repositories
        </p>
      </div>

      <GitHubReposTable />
    </div>
  );
}
