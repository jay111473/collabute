import { FC } from "react";
import { Lead, User } from "@/types/dashboard";
import ProjectManagersClient from "./ProjectLeadsClient";

interface ProjectManagersProps {
  projectManagers: User[];
}

const ProjectManagers: FC<ProjectManagersProps> = ({ projectManagers }) => {
  return <ProjectManagersClient projectManagers={projectManagers} />;
};

export default ProjectManagers;
