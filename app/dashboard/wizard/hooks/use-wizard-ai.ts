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
      const response = await fetch("/api/wizard-industry-competitors-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectIdea }),
      });

      const data = await response.json();

      if (data.error) {
        return null;
      }

      if (data.categories?.length > 0 && data.competitors?.length > 0) {
        // Update the legacy state for backward compatibility
        setSuggestedCompetitors(data.competitors);
        return data;
      }

      return null;
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
      const response = await fetch("/api/wizard-business-comparison-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectIdea }),
      });

      const data = await response.json();

      if (data.error) {
        return null;
      }

      if (data.categories?.length > 0 && data.competitors?.length > 0) {
        return data;
      }

      return null;
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
      const response = await fetch("/api/wizard-project-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectInfo),
      });

      const data = await response.json();

      if (data.projects) {
        setSuggestedProjects(data.projects);
        setTotalEstimatedDuration(data.totalEstimatedDuration || 0);
        setCriticalPath(data.criticalPath || []);
        setParallelizationOpportunities(
          data.parallelizationOpportunities || []
        );

        return {
          projects: data.projects,
          totalEstimatedDuration: data.totalEstimatedDuration || 0,
          criticalPath: data.criticalPath || [],
          parallelizationOpportunities: data.parallelizationOpportunities || [],
        };
      }

      return null;
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
      const response = await fetch("/api/wizard-tracks-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectInfo,
          competitors,
          projects,
        }),
      });

      const data = await response.json();

      if (data.error) {
        return null;
      }

      if (data.tracks?.length > 0) {
        setSuggestedTracks(data.tracks);
        
        // Update timeline data if available
        if (data.totalEstimatedDuration) {
          setTotalEstimatedDuration(data.totalEstimatedDuration);
        }
        if (data.criticalPath) {
          setCriticalPath(data.criticalPath);
        }
        if (data.parallelizationOpportunities) {
          // Convert track-based parallelization to project-based for backward compatibility
          const projectParallelization = data.parallelizationOpportunities.map((opp: any) => ({
            projectIds: opp.trackIds || [], // Map trackIds to projectIds for compatibility
            description: opp.description,
          }));
          setParallelizationOpportunities(projectParallelization);
        }

        return {
          platformAnalysis: data.platformAnalysis,
          tracks: data.tracks,
          totalEstimatedDuration: data.totalEstimatedDuration || 0,
          criticalPath: data.criticalPath || [],
          parallelizationOpportunities: data.parallelizationOpportunities || [],
        };
      }

      return null;
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
