import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  GeneratedProject,
  ProjectsResponse,
  Industry,
  Competitor,
  ProjectTrack,
  FeatureComparisonData,
  BusinessComparisonData,
  TracksResponse,
  UseWizardAiReturn,
} from "@/types/wizard";

export function useWizardAi(): UseWizardAiReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedIndustries, setSuggestedIndustries] = useState<Industry[]>(
    []
  );
  const [suggestedCompetitors, setSuggestedCompetitors] = useState<
    Competitor[]
  >([]);
  const [suggestedProjects, setSuggestedProjects] = useState<
    GeneratedProject[]
  >([]);
  const [suggestedTracks, setSuggestedTracks] = useState<ProjectTrack[]>([]);
  const [totalEstimatedDuration, setTotalEstimatedDuration] =
    useState<number>(0);
  const [criticalPath, setCriticalPath] = useState<string[]>([]);
  const [parallelizationOpportunities, setParallelizationOpportunities] =
    useState<
      Array<{
        projectIds: string[];
        description: string;
      }>
    >([]);

  // Convex actions
  const generateFeatureComparison = useAction(
    api.wizard.generateFeatureComparison
  );
  const generateBusinessComparison = useAction(
    api.wizard.generateBusinessComparison
  );
  const generateProjects = useAction(api.wizard.generateProjects);
  const generateTracks = useAction(api.wizard.generateTracks);

  const fetchFeatureComparison = async (
    projectIdea: string
  ): Promise<FeatureComparisonData | null> => {
    setIsLoading(true);
    try {
      const result = await generateFeatureComparison({ projectIdea });
      setSuggestedCompetitors(result.competitors);
      return result;
    } catch (error) {
      console.error("Error fetching feature comparison:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBusinessComparison = async (
    projectIdea: string
  ): Promise<BusinessComparisonData | null> => {
    setIsLoading(true);
    try {
      const result = await generateBusinessComparison({ projectIdea });
      return result;
    } catch (error) {
      console.error("Error fetching business comparison:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async (projectInfo: {
    name: string;
    description: string;
    industries: string[];
    projectPlatforms: { value: string; isCore?: boolean }[];
  }): Promise<ProjectsResponse | null> => {
    setIsLoading(true);
    try {
      const result = await generateProjects({
        name: projectInfo.name,
        description: projectInfo.description,
        industries: projectInfo.industries,
        projectPlatforms: projectInfo.projectPlatforms,
      });

      setSuggestedProjects(result.projects);
      setTotalEstimatedDuration(result.totalEstimatedDuration);
      setCriticalPath(result.criticalPath);
      setParallelizationOpportunities(result.parallelizationOpportunities);

      return result;
    } catch (error) {
      console.error("Error fetching projects:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTracks = async (
    projectInfo: { idea: string; industries: string[] },
    competitors: Competitor[],
    projects: GeneratedProject[]
  ): Promise<TracksResponse | null> => {
    setIsLoading(true);
    try {
      const result = await generateTracks({
        projectInfo,
        competitors,
        projects,
      });

      setSuggestedTracks(result.tracks);
      setTotalEstimatedDuration(result.totalEstimatedDuration);
      setCriticalPath(result.criticalPath);
      // Convert trackIds to projectIds for compatibility
      const convertedOpportunities = result.parallelizationOpportunities.map(
        (opp) => ({
          projectIds: opp.trackIds || [],
          description: opp.description,
        })
      );
      setParallelizationOpportunities(convertedOpportunities);

      return result;
    } catch (error) {
      console.error("Error fetching tracks:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const resetSuggestions = () => {
    setSuggestedIndustries([]);
    setSuggestedCompetitors([]);
    setSuggestedProjects([]);
    setSuggestedTracks([]);
    setTotalEstimatedDuration(0);
    setCriticalPath([]);
    setParallelizationOpportunities([]);
  };

  return {
    isLoading,
    suggestedIndustries,
    suggestedCompetitors,
    suggestedProjects,
    suggestedTracks,
    totalEstimatedDuration,
    criticalPath,
    parallelizationOpportunities,
    fetchFeatureComparison,
    fetchBusinessComparison,
    fetchProjects,
    fetchTracks,
    resetSuggestions,
  };
}
