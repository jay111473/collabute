import React from "react";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import ProjectPageComponent from "@/components/dashboard/projects";
import { redirect } from "next/navigation";

const ProjectPage = async ({
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
    <div>
      <ProjectPageComponent project={project} />
    </div>
  );
};

export default ProjectPage;
