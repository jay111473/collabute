import React from "react";
import { getProject } from "@/lib/get-project";
import ProjectDetailsView from "@/components/dashboard/projects/project-details-view";

const ProjectDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const project = await getProject(slug);

  return (
    <div className="flex h-full min-h-screen">
      <ProjectDetailsView project={project} />
    </div>
  );
};

export default ProjectDetailsPage;
