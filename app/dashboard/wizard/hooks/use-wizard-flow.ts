import { useState, useEffect, useRef } from "react";
import { useWizardData } from "./use-wizard-data";
import { useWizardNavigation } from "./use-wizard-navigation";
import { useWizardAi } from "./use-wizard-ai";
import { useGitHubAccess } from "./use-github-access";

export function useWizardFlow(userId?: string) {
  const wizardDataHook = useWizardData();
  const { wizardData } = wizardDataHook;
  const ai = useWizardAi();
  const gitHubAccess = useGitHubAccess(userId || null);

  // State for tracking AI calls
  const [lastProcessedIdea, setLastProcessedIdea] = useState("");
  const [hasCalledProjectsAI, setHasCalledProjectsAI] = useState(false);
  const [hasCalledTracksAI, setHasCalledTracksAI] = useState(false);
  const [hasCalledBusinessComparisonAI, setHasCalledBusinessComparisonAI] =
    useState(false);
  const [hasCalledFeatureComparisonAI, setHasCalledFeatureComparisonAI] =
    useState(false);

  // Meeting and subscription state
  const [hasBookedMeeting, setHasBookedMeeting] = useState(false);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);

  const navigation = useWizardNavigation(wizardData, hasBookedMeeting, gitHubAccess.hasGitHubAccess);

  // Refs to prevent multiple calls
  const businessComparisonCallInProgress = useRef(false);
  const featureComparisonCallInProgress = useRef(false);
  const tracksCallInProgress = useRef(false);
  const projectsCallInProgress = useRef(false);

  // Auto-call business comparison when reaching step 1
  useEffect(() => {
    const callBusinessComparisonAI = async () => {
      if (
        navigation.currentStep === 1 &&
        wizardData.projectInfo?.idea &&
        wizardData.projectInfo.idea !== lastProcessedIdea &&
        !wizardData.businessComparison &&
        !businessComparisonCallInProgress.current
      ) {
        businessComparisonCallInProgress.current = true;

        // Use original idea if available, otherwise use processed idea
        const ideaToUse =
          wizardData.projectInfo.originalIdea || wizardData.projectInfo.idea;

        try {
          const result = await ai.fetchBusinessComparison(ideaToUse);

          if (result) {
            setLastProcessedIdea(wizardData.projectInfo.idea);
            wizardDataHook.updateBusinessComparison(result);
            wizardDataHook.updateCompetitors(result.competitors);

            // Ensure industries are set if they're not already
            if (
              !wizardData.projectInfo?.industries ||
              wizardData.projectInfo.industries.length === 0
            ) {
              // Extract industries from the project idea or set defaults
              const defaultIndustries = ["technology", "software-development"];
              wizardDataHook.updateIndustries(defaultIndustries);
            }
          }
        } catch (error) {
          // Silent error handling
        } finally {
          businessComparisonCallInProgress.current = false;
        }
      }
    };

    callBusinessComparisonAI();
  }, [
    navigation.currentStep,
    wizardData.projectInfo?.idea,
    wizardData.businessComparison,
  ]);

  // Auto-populate project info from GitHub repository
  useEffect(() => {
    if (
      navigation.currentStep === 3 &&
      wizardData.githubRepository &&
      (!wizardData.projectInfo?.name || wizardData.projectInfo.name === "")
    ) {
      wizardDataHook.updateProjectInfo({
        ...wizardData.projectInfo!,
        name: wizardData.githubRepository.name,
        description: wizardData.githubRepository.description || "",
      });
    }
  }, [navigation.currentStep, wizardData.githubRepository]);

  const handleNext = async () => {
    // Validate GitHub access before proceeding to project creation steps
    if (navigation.currentStep >= 0 && !gitHubAccess.hasGitHubAccess) {
      console.warn("Cannot proceed: GitHub access not verified");
      return;
    }

    // Handle step 1 -> 2: Fetch feature comparison for step 2
    if (
      navigation.currentStep === 1 &&
      !hasCalledFeatureComparisonAI &&
      wizardData.projectInfo?.idea &&
      !wizardData.featureComparison &&
      !featureComparisonCallInProgress.current
    ) {
      featureComparisonCallInProgress.current = true;

      try {
        const ideaToUse =
          wizardData.projectInfo.originalIdea || wizardData.projectInfo.idea;

        const featureResult = await ai.fetchFeatureComparison(ideaToUse);

        if (featureResult) {
          setHasCalledFeatureComparisonAI(true);
          wizardDataHook.updateFeatureComparison(featureResult);
        }
      } catch (error) {
        // Silent error handling
      } finally {
        featureComparisonCallInProgress.current = false;
      }
    }

    // Handle step 2 -> 3: Fetch tracks (BusinessComparison -> ProjectTracks)
    if (
      navigation.currentStep === 2 &&
      !hasCalledTracksAI &&
      wizardData.projectInfo?.idea &&
      wizardData.competitors.length > 0 &&
      (!wizardData.tracks || wizardData.tracks.length === 0) &&
      !tracksCallInProgress.current
    ) {
      tracksCallInProgress.current = true;

      try {
        // Use the actual user's idea for tracks generation
        const projectInfoForTracks = {
          ...wizardData.projectInfo,
          idea:
            wizardData.projectInfo.originalIdea || wizardData.projectInfo.idea,
        };

        const result = await ai.fetchTracks(
          projectInfoForTracks,
          wizardData.competitors,
          wizardData.projects || []
        );

        if (result && result.tracks && result.tracks.length > 0) {
          setHasCalledTracksAI(true);
          wizardDataHook.updateTracksResponse(result);
        }
      } catch (error) {
        // Silent error handling
      } finally {
        tracksCallInProgress.current = false;
      }
    }

    // Handle step 3 -> 4: Fetch projects (ProjectTracks -> ProjectGenerator)
    if (
      navigation.currentStep === 3 &&
      !hasCalledProjectsAI &&
      wizardData.projectInfo &&
      wizardData.competitors.length > 0 &&
      (!wizardData.projects || wizardData.projects.length === 0) &&
      !projectsCallInProgress.current
    ) {
      projectsCallInProgress.current = true;

      try {
        // Use the actual user's idea for project generation
        const projectInfoForAPI = {
          name: "Project Idea",
          description:
            wizardData.projectInfo.originalIdea || wizardData.projectInfo.idea,
          industries: wizardData.projectInfo.industries,
          projectPlatforms: wizardData.projectInfo.projectPlatforms || [],
        };

        const projectsResponse = await ai.fetchProjects(projectInfoForAPI);
        if (projectsResponse) {
          setHasCalledProjectsAI(true);
          wizardDataHook.updateProjects(projectsResponse.projects);
        }
      } catch (error) {
        // Silent error handling
      } finally {
        projectsCallInProgress.current = false;
      }
    }

    // Handle step 3 -> show subscription popup (ProjectTracks -> Subscription)
    if (navigation.currentStep === 3) {
      setShowSubscriptionPopup(true);
      return; // Don't proceed to next step yet, wait for user choice
    }

    // Proceed to next step for all other cases
    navigation.goToNextStep();
  };

  const handleBookMeeting = () => {
    setHasBookedMeeting(true);
  };

  const handleSubscriptionChoice = (
    choice: "pro" | "enterprise" | "limited"
  ) => {
    setShowSubscriptionPopup(false);

    // TODO: Handle subscription logic here
    if (choice === "pro") {
      // Handle Pro subscription
    } else if (choice === "enterprise") {
      // Handle Enterprise subscription
    } else {
      // Handle limited version
    }

    // Proceed to next step after choice is made
    navigation.goToNextStep();
  };

  const handleCloseSubscriptionPopup = () => {
    setShowSubscriptionPopup(false);
    // Don't proceed to next step if user just closes the popup
  };

  const resetAiStates = () => {
    setLastProcessedIdea("");
    setHasCalledProjectsAI(false);
    setHasCalledTracksAI(false);
    setHasCalledBusinessComparisonAI(false);
    setHasCalledFeatureComparisonAI(false);
    businessComparisonCallInProgress.current = false;
    featureComparisonCallInProgress.current = false;
    tracksCallInProgress.current = false;
    projectsCallInProgress.current = false;
    ai.resetSuggestions();
  };

  const retryBusinessComparison = async () => {
    if (businessComparisonCallInProgress.current) return;

    setLastProcessedIdea("");
    businessComparisonCallInProgress.current = true;

    if (wizardData.projectInfo?.idea) {
      try {
        const ideaToUse =
          wizardData.projectInfo.originalIdea || wizardData.projectInfo.idea;

        const businessResult = await ai.fetchBusinessComparison(ideaToUse);

        if (businessResult) {
          setLastProcessedIdea(wizardData.projectInfo.idea);
          wizardDataHook.updateBusinessComparison(businessResult);
          wizardDataHook.updateCompetitors(businessResult.competitors);
        }
      } catch (error) {
        // Silent error handling
      } finally {
        businessComparisonCallInProgress.current = false;
      }
    }
  };

  const retryFeatureComparison = async () => {
    if (featureComparisonCallInProgress.current) return;

    setHasCalledFeatureComparisonAI(false);
    featureComparisonCallInProgress.current = true;

    if (wizardData.projectInfo?.idea) {
      try {
        const ideaToUse =
          wizardData.projectInfo.originalIdea || wizardData.projectInfo.idea;

        const result = await ai.fetchFeatureComparison(ideaToUse);

        if (result) {
          setHasCalledFeatureComparisonAI(true);
          wizardDataHook.updateFeatureComparison(result);
        }
      } catch (error) {
        // Silent error handling
      } finally {
        featureComparisonCallInProgress.current = false;
      }
    }
  };

  return {
    // Data
    hasBookedMeeting,
    showSubscriptionPopup,

    // Navigation
    currentStep: navigation.currentStep,
    canProceedToNextStep: navigation.canProceedToNextStep,
    goToNextStep: navigation.goToNextStep,
    goToPreviousStep: navigation.goToPreviousStep,

    // AI
    isLoading: ai.isLoading,
    suggestedIndustries: ai.suggestedIndustries,
    suggestedCompetitors: ai.suggestedCompetitors,
    suggestedProjects: ai.suggestedProjects,
    suggestedTracks: ai.suggestedTracks,
    // Project Gantt chart data
    totalEstimatedDuration: ai.totalEstimatedDuration,
    criticalPath: ai.criticalPath,
    parallelizationOpportunities: ai.parallelizationOpportunities,

    // GitHub Access
    gitHubAccess,

    // Handlers
    handleNext,
    handleBookMeeting,
    handleSubscriptionChoice,
    handleCloseSubscriptionPopup,
    resetAiStates,

    // Data update functions (includes wizardData)
    ...wizardDataHook,

    // Retry functions
    retryBusinessComparison,
    retryFeatureComparison,
  };
}
