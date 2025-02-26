import { FC } from "react";
import { Lead, User } from "@/types/dashboard";
import ProjectLeadsClient from "./ProjectLeadsClient";

interface ProjectLeadsProps {
  leads: User[];
}

const ProjectLeads: FC<ProjectLeadsProps> = ({ leads }) => {
  return <ProjectLeadsClient leads={leads} />;
};

export default ProjectLeads;
