import React from "react";
import { getProject } from "@/lib/get-project";
import ProjectPageComponent from "@/components/dashboard";

const ProjectPage = async ({ params }: { params: { slug: string } }) => {
  const { slug } = await params;
  const { docs } = await getProject(slug);
  console.log(docs);
  const project = docs[0];

  return (
    <div>
      <ProjectPageComponent project={project} />
    </div>
  );
};

export default ProjectPage;
