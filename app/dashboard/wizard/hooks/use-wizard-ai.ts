import { useState } from "react";
import {
  GeneratedProject,
  ProjectsResponse,
  Industry,
  Competitor,
  ProjectTrack,
  FeatureComparisonData,
  BusinessComparisonData,
  TracksResponse,
  UseWizardAiReturn
} from "@/types/wizard";

export function useWizardAi(): UseWizardAiReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedIndustries, setSuggestedIndustries] = useState<Industry[]>([]);
  const [suggestedCompetitors, setSuggestedCompetitors] = useState<Competitor[]>([]);
  const [suggestedProjects, setSuggestedProjects] = useState<GeneratedProject[]>([]);
  const [suggestedTracks, setSuggestedTracks] = useState<ProjectTrack[]>([]);
  const [totalEstimatedDuration, setTotalEstimatedDuration] = useState<number>(0);
  const [criticalPath, setCriticalPath] = useState<string[]>([]);
  const [parallelizationOpportunities, setParallelizationOpportunities] = useState<
    Array<{
      projectIds: string[];
      description: string;
    }>
  >([]);

  const fetchFeatureComparison = async (
    projectIdea: string
  ): Promise<FeatureComparisonData | null> => {
    setIsLoading(true);
    try {
      // TODO: Replace with Convex function for AI feature comparison
      // Mock data for now
      const mockData = {
        categories: [
          { name: "Technology", description: "Tech solutions" },
        ],
        competitors: [
          { name: "Example Competitor", description: "Sample competitor" },
        ],
      };

      setSuggestedCompetitors(mockData.competitors);
      return mockData as FeatureComparisonData;
    } catch (error) {
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
      // TODO: Replace with Convex function for AI business comparison
      // Mock data for now
      const mockData = {
        categories: [
          { name: "Business", description: "Business category" },
        ],
        competitors: [
          { name: "Business Competitor", description: "Sample business competitor" },
        ],
      };

      return mockData as BusinessComparisonData;
    } catch (error) {
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
      // TODO: Replace with Convex function for AI project generation
      // Mock data for now
      const mockProjects = [
        {
          id: "1",
          name: "Sample Project",
          description: "A sample project based on your idea",
          estimatedDuration: 30,
          complexity: "medium" as const,
        },
      ];

      setSuggestedProjects(mockProjects);
      setTotalEstimatedDuration(30);
      setCriticalPath(["1"]);
      setParallelizationOpportunities([]);

      return {
        projects: mockProjects,
        totalEstimatedDuration: 30,
        criticalPath: ["1"],
        parallelizationOpportunities: [],
      };
    } catch (error) {
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
      // TODO: Replace with Convex function for AI tracks generation
      // Mock data for now
      const mockTracks = [
        {
          id: "1",
          name: "Development Track",
          description: "Main development track",
          estimatedDuration: 20,
          complexity: "medium" as const,
        },
      ];

      setSuggestedTracks(mockTracks);
      setTotalEstimatedDuration(20);
      setCriticalPath(["1"]);
      setParallelizationOpportunities([]);

      return {
        platformAnalysis: { recommended: "web", alternatives: ["mobile"] },
        tracks: mockTracks,
        totalEstimatedDuration: 20,
        criticalPath: ["1"],
        parallelizationOpportunities: [],
      };
    } catch (error) {
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
