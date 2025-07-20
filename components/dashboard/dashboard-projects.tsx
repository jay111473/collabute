"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentProjectCard } from "@/components/dashboard/projects/recent-project-card";
import { useProjectsConvex } from "@/hooks/use-projects-convex";
import { Project } from "@/types/dashboard";

const RecentProjectsList = ({ projects }: { projects: Project[] }) => (
  <div className="space-y-3">
    {projects.slice(0, 3).map((project) => (
      <RecentProjectCard key={project.id} project={project} />
    ))}
  </div>
);

export default function DashboardProjects() {
  const { projects, loading, error } = useProjectsConvex({ limit: 3 });

  if (loading) {
    return (
      <Card className="bg-darkGray border-none">
        <CardHeader>
          <CardTitle className="text-white">Recent Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded animate-pulse"></div>
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