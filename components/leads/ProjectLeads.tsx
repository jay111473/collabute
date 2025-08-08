import { FC } from "react";
import { User } from "@/types/convex";
import ProjectManagersClient from "./ProjectLeadsClient";

interface ProjectManagersProps {
  projectManagers: User[];
}

const ProjectManagers: FC<ProjectManagersProps> = ({ projectManagers }) => {
  return <ProjectManagersClient projectManagers={projectManagers} />;
};

export default ProjectManagers;
