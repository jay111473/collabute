import { useState } from "react";
import {
  ProjectType,
  GeneratedProject,
  WizardData,
  ProjectInfo,
  Competitor,
  Lead,
  GitHubRepository,
  Industry,
  ProjectTrack,
  Feature,
  Category,
  FeatureComparisonData,
  BusinessComparisonData,
  PlatformAnalysis,
  TracksResponse
} from "@/types/wizard";

const defaultWizardData: WizardData = {
  projectType: null,
  projectInfo: {
    idea: "",
    name: "",
    description: "",
    industries: [],
    projectPlatforms: [],
  },
  competitors: [],
  featureComparison: null,
  businessComparison: null,
  projects: [],
  tracks: [],
  tracksResponse: null,
  leader: null,
  githubRepository: null,
};

export function useWizardData() {
  const [wizardData, setWizardData] = useState<WizardData>(defaultWizardData);

  const updateProjectType = (type: ProjectType) => {
    setWizardData((prev) => ({ ...prev, projectType: type }));
  };

  const updateProjectInfo = (info: Partial<ProjectInfo>) => {
    setWizardData((prev) => ({ 
      ...prev, 
      projectInfo: {
        ...prev.projectInfo!,
        ...info
      }
    }));
  };

  const updateCompetitors = (competitors: Competitor[]) => {
    setWizardData((prev) => ({ ...prev, competitors }));
  };

  const updateFeatureComparison = (featureComparison: FeatureComparisonData) => {
    setWizardData((prev) => ({ ...prev, featureComparison }));
  };

  const updateBusinessComparison = (businessComparison: BusinessComparisonData) => {
    setWizardData((prev) => ({ ...prev, businessComparison }));
  };

  const updateProjects = (projects: GeneratedProject[]) => {
    setWizardData((prev) => ({ ...prev, projects }));
  };

  const updateTracks = (tracks: ProjectTrack[]) => {
    setWizardData((prev) => ({ ...prev, tracks }));
  };

  const updateTracksResponse = (tracksResponse: TracksResponse) => {
    setWizardData((prev) => ({ 
      ...prev, 
      tracksResponse,
      tracks: tracksResponse.tracks 
    }));
  };

  const updateLeader = (leader: Lead | null) => {
    setWizardData((prev) => ({ ...prev, leader }));
  };

  const updateIndustries = (industries: string[]) => {
    setWizardData((prev) => ({
      ...prev,
      projectInfo: {
        ...prev.projectInfo!,
        industries,
      },
    }));
  };

  const updateGitHubRepository = (repository: GitHubRepository) => {
    setWizardData((prev) => ({
      ...prev,
      githubRepository: repository,
      projectInfo: {
        ...prev.projectInfo!,
        name: repository.name,
        description: repository.description || prev.projectInfo?.description || "",
      },
    }));
  };

  return {
    wizardData,
    updateProjectType,
    updateProjectInfo,
    updateCompetitors,
    updateFeatureComparison,
    updateBusinessComparison,
    updateProjects,
    updateTracks,
    updateTracksResponse,
    updateLeader,
    updateIndustries,
    updateGitHubRepository,
  };
}

export type { 
  WizardData, 
  ProjectInfo, 
  Competitor, 
  Lead, 
  GitHubRepository, 
  Industry, 
  ProjectTrack, 
  Feature, 
  Category, 
  FeatureComparisonData, 
  BusinessComparisonData,
  PlatformAnalysis,
  TracksResponse
}; 