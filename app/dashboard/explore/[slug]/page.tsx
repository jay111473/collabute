import React from "react";
import { getProject } from "@/lib/get-project";
import ProjectPageComponent from "@/components/dashboard/projects";

const ProjectPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const project = await getProject(slug);

  return (
    <div>
      <ProjectPageComponent project={project} />
    </div>
  );
};

export default ProjectPage;
