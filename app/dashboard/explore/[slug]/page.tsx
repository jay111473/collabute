import React from "react";
import { getProject } from "@/lib/get-project";
import ProjectPageComponent from "@/components/dashboard/projects";

const ProjectPage = async ({ params }: { params: Promise<any> }) => {
  const { slug } = await params;
  const { docs } = await getProject(slug);
  const project = docs[0];

  return (
    <div>
      <ProjectPageComponent project={project} />
    </div>
  );
};

export default ProjectPage;
