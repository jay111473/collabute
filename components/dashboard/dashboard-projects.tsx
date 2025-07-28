"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentProjectCard } from "@/components/dashboard/projects/recent-project-card";
import { Doc } from "@/convex/_generated/dataModel";

type ProjectWithData = Doc<"projects"> & {
  owner?: any;
  teamLead?: any;
  issueCount?: number;
  collaboratorCount?: number;
  startDate: string;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  milestones: any;
  stacks: string[];
  tags: Array<{ tag: string; id: string }>;
};

const RecentProjectsList = ({ projects }: { projects: ProjectWithData[] }) => (
  <div className="space-y-3">
    {projects.slice(0, 3).map((project) => (
      <RecentProjectCard key={project._id} project={project} />
    ))}
  </div>
);

export default function DashboardProjects() {
  const projects = useQuery(api.projects.getAllProjects, { limit: 3 });
  const loading = projects === undefined;
  const error = null; // Convex handles errors gracefully

  if (loading) {
    return (
      <Card className="bg-darkGray border-none">
        <CardHeader>
          <CardTitle className="text-white">Recent Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-700 rounded animate-pulse"
            ></div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-darkGray border-none">
        <CardHeader>
          <CardTitle className="text-white">Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error loading projects</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-darkGray border-none">
      <CardHeader>
        <CardTitle className="text-white">Recent Projects</CardTitle>
      </CardHeader>
      <CardContent className="p-0 px-2 pb-4">
        {projects && projects.length > 0 ? (
          <RecentProjectsList projects={projects} />
        ) : (
          <p className="text-white/60 text-center py-4">No projects yet</p>
        )}
      </CardContent>
    </Card>
  );
}
