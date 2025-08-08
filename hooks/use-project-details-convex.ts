import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const useProjectDetails = (projectId: Id<"projects">) => {
  const projectDetails = useQuery(api.projects.getProjectDetailsById, {
    projectId,
  });

  return {
    projectDetails,
    isLoading: projectDetails === undefined,
    issues: projectDetails?.issues || [],
    collaborators: projectDetails?.collaborators || [],
    issueCount: projectDetails?.issueCount || 0,
    collaboratorCount: projectDetails?.collaboratorCount || 0,
  };
};

export const useProjectDetailsBySlug = (slug: string) => {
  const projectDetails = useQuery(api.projects.getProjectDetailsBySlug, {
    slug,
  });

  return {
    projectDetails,
    isLoading: projectDetails === undefined,
    issues: projectDetails?.issues || [],
    collaborators: projectDetails?.collaborators || [],
    issueCount: projectDetails?.issueCount || 0,
    collaboratorCount: projectDetails?.collaboratorCount || 0,
  };
};