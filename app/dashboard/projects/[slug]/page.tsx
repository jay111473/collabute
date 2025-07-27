import React from "react";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import ProjectDetailsView from "@/components/dashboard/projects/project-details-view";
import { redirect } from "next/navigation";

const ProjectDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  
  const preloaded = await preloadQuery(api.projects.getProjectBySlug, {
    slug,
  });
  
  const project = preloaded._valueJSON as any;
  
  if (!project) {
    redirect("/dashboard/projects");
  }

  return (
    <div className="flex h-full min-h-screen">
      <ProjectDetailsView project={project} />
    </div>
  );
};

export default ProjectDetailsPage;
