"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WizardLogo } from "@/components/wizard/logo";
import { WizardSteps } from "@/components/wizard/steps";
import { WizardVideoPreview } from "@/components/wizard/video-preview";
import { StepIndicator } from "@/components/wizard/step-indicator";
import { ProjectInfo } from "@/components/wizard/project-info";
import { ProjectTimeline } from "@/components/wizard/project-timeline";
import {
  Stack,
  Project,
  Feature,
  ProjectType,
  GeneratedProject,
} from "@/types/wizard";
import { ProjectLeader } from "@/components/wizard/project-leader";
import { IndustryCompetitors } from "@/components/wizard/industry-competitors";
import { ProjectType as ProjectTypeComponent } from "@/components/wizard/project-type";
import { Loader2 } from "lucide-react";
import { GitHubImport } from "@/components/wizard/github-import";
import { ProjectGenerator } from "@/components/wizard/project-generator";
import { useSearchParams } from "next/navigation";
import { getCookie } from "cookies-next";
import { cn } from "@/lib/utils";
import { TpmDetails } from "@/components/wizard/tpm-details";

interface Industry {
  label: string;
  value: string;
}

interface Competitor {
  name: string;
  url: string;
  slogan?: string;
  yearFounded?: number;
  businessScale?: "Startup" | "SMB" | "Enterprise" | "Global Enterprise";
  marketShare?: {
    percentage: number;
    region: string;
  };
  description?: string;
}

interface Lead {
  id: number;
  name: string;
  experience: number;
  stack: (number | Stack)[];
  projects?: (number | Project)[] | null;
  availability?: boolean | null;
  updatedAt: string;
  createdAt: string;
}

interface WizardData {
  projectType: ProjectType | null;
  projectInfo: {
    name: string;
    description: string;
    industries: string[];
    projectPlatforms: {
      value: string;
      isCore?: boolean;
    }[];
  } | null;
  competitors: Competitor[];
  projects: GeneratedProject[];
  leader: Lead | null;
  githubRepository?: {
    repoId: string;
    name: string;
    fullName: string;
    url: string;
    isPrivate: boolean;
    description?: string;
    language?: string;
    defaultBranch?: string;
  } | null;
}

function LoadingOverlay({ step }: { step: number }) {
  const getMessage = () => {
    switch (step) {
      case 2:
        return {
          title: "Analyzing Your Project",
          description:
            "Our AI is processing your project details to suggest relevant industries and competitors. This may take a few moments...",
        };
      case 3:
        return {
          title: "Wrapping up your project",
          description:
            "We're wrapping up your project and preparing the final details...",
        };
      case 4:
        return {
          title: "Planning Development",
          description:
            "Organizing features and creating a development timeline...",
        };
      default:
        return {
          title: "Processing",
          description: "Please wait while we process your request...",
        };
    }
  };

  const message = getMessage();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="bg-zinc-900/90 border border-darkPrimary/20 rounded-xl p-8 max-w-md w-full mx-4 space-y-4">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-darkPrimary" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-medium text-white">{message.title}</h3>
          <p className="text-sm text-gray-400">{message.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function Wizard() {
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");

  // Parse step from URL or default to 0
  const getInitialStep = () => {
    if (stepParam) {
      const parsedStep = parseFloat(stepParam);
      return !isNaN(parsedStep) ? parsedStep : 0;
    }
    return 0;
  };
  const [currentStep, setCurrentStep] = useState<number>(getInitialStep());
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
  const [hasCalledIndustryCompetitorsAI, setHasCalledIndustryCompetitorsAI] =
    useState(false);
  const [wizardData, setWizardData] = useState<WizardData>(() => {
    // Try to load saved data from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wizardData");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved wizard data:", e);
        }
      }
    }
    // Default initial state
    return {
      projectType: null,
      projectInfo: {
        name: "",
        description: "",
        industries: [],
        projectPlatforms: [],
      },
      competitors: [],
      projects: [],
      leader: null,
      githubRepository: null,
    };
  });
  const [hasCalledAI, setHasCalledAI] = useState(false);
  const [hasCalledCompetitorsAI, setHasCalledCompetitorsAI] = useState(false);
  const [hasCalledProjectsAI, setHasCalledProjectsAI] = useState(false);
  const [previousData, setPreviousData] = useState<WizardData | null>(null);
  const [hasBookedMeeting, setHasBookedMeeting] = useState(false);

  const userid = getCookie("userid") as string;
  const token = getCookie("token") as string;
  // Check for GitHub auth success and update step accordingly
  useEffect(() => {
    const githubAuthSuccess = searchParams.get("github_auth_success");
    if (githubAuthSuccess === "true") {
      // If we have successfully authenticated with GitHub

      // First ensure the step is set to GitHub import
      const step = searchParams.get("step") || "1.5";
      setCurrentStep(parseFloat(step));

      // Clean up URL by removing github_auth_success parameter
      // while preserving the step parameter
      const params = new URLSearchParams(searchParams.toString());
      params.delete("github_auth_success");

      // Update the URL without reloading the page
      const url = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({ path: url }, "", url);
    }
  }, [searchParams]);

  // Update URL when step changes
  useEffect(() => {
    // Don't update URL on initial render if we already have a step param
    if (stepParam && parseFloat(stepParam) === currentStep) {
      return;
    }
    updateStep(currentStep);
  }, [currentStep]);

  // Function to update URL with current step
  const updateStep = (step: number) => {
    // Create a new URLSearchParams object and set the step
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", step.toString());

    // Update the URL without reloading the page
    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ path: url }, "", url);
  };

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("wizardData", JSON.stringify(wizardData));
  }, [wizardData]);

  // Ensure that when we skip from GitHub import to industry selection,
  // we have proper project info data populated
  useEffect(() => {
    // When we move from step 1.5 (GitHub import) to step 3 (industries)
    // Make sure we have populated project info from the GitHub repository
    if (
      currentStep === 3 &&
      wizardData.githubRepository &&
      (!wizardData.projectInfo?.name || wizardData.projectInfo.name === "")
    ) {
      setWizardData((prev) => ({
        ...prev,
        projectInfo: {
          ...prev.projectInfo!,
          name: wizardData.githubRepository?.name || "",
          description: wizardData.githubRepository?.description || "",
        },
      }));
    }
  }, [currentStep, wizardData.githubRepository]);

  // Check if data has changed from previous state
  const hasDataChanged = (step: number) => {
    if (!previousData) return false;

    switch (step) {
      case 1:
        return previousData.projectType !== wizardData.projectType;
      case 2:
        return (
          previousData.projectInfo?.name !== wizardData.projectInfo?.name ||
          previousData.projectInfo?.description !==
            wizardData.projectInfo?.description ||
          JSON.stringify(previousData.projectInfo?.projectPlatforms) !==
            JSON.stringify(wizardData.projectInfo?.projectPlatforms)
        );
      case 3:
        return (
          JSON.stringify(previousData.projectInfo?.industries) !==
          JSON.stringify(wizardData.projectInfo?.industries)
        );
      case 4:
        return (
          JSON.stringify(previousData.competitors) !==
          JSON.stringify(wizardData.competitors)
        );
      case 5:
        return (
          JSON.stringify(previousData.projects) !==
          JSON.stringify(wizardData.projects)
        );
      case 6:
        return (
          JSON.stringify(previousData.leader) !==
          JSON.stringify(wizardData.leader)
        );
      default:
        return false;
    }
  };

  const handleNext = async () => {
    // Store current state before processing
    setPreviousData({ ...wizardData });

    // Reset AI states if data has changed
    if (hasDataChanged(currentStep)) {
      if (currentStep === 2) {
        setHasCalledAI(false);
        setHasCalledIndustryCompetitorsAI(false);
      }
      if (currentStep === 3) setHasCalledProjectsAI(false);
    }

    // Handle branching flow based on project type
    if (currentStep === 1 && wizardData.projectType === "existing") {
      // If user selected existing project, go to GitHub import step
      setCurrentStep(1.5); // Using a decimal step number to represent the GitHub import step
      return;
    }

    // If we're at GitHub import step and moving forward, go to step 3 (industry selection)
    // Skip project info for existing projects since we already have GitHub repository details
    if (currentStep === 1.5) {
      setCurrentStep(3);
      return;
    }

    // Call combined industry-competitors AI when moving from step 2 to 3
    if (
      currentStep === 2 &&
      !hasCalledIndustryCompetitorsAI &&
      wizardData.projectInfo?.name &&
      wizardData.projectInfo?.description
    ) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/wizard-industry-competitors-ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectName: wizardData.projectInfo.name,
            description: wizardData.projectInfo.description,
          }),
        });

        const data = await response.json();

        if (data.error) {
          console.error(
            "Industry-Competitors API error:",
            data.error,
            data.missingFields
          );
          return;
        }

        if (data.industries?.length > 0 && data.competitors?.length > 0) {
          setSuggestedIndustries(data.industries);
          setSuggestedCompetitors(data.competitors);
          setHasCalledIndustryCompetitorsAI(true);

          // Set initial industries and competitors
          setWizardData((prev) => ({
            ...prev,
            projectInfo: {
              ...prev.projectInfo!,
              industries: data.industries.map(
                (industry: Industry) => industry.value
              ),
            },
            competitors: data.competitors,
          }));

          // Move to next step after getting both industries and competitors
          setCurrentStep(currentStep + 1);
        }
      } catch (error) {
        console.error("Error fetching industries and competitors:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Call projects AI when moving from step 3 to 4
    if (
      currentStep === 3 &&
      !hasCalledProjectsAI &&
      wizardData.projectInfo &&
      wizardData.competitors.length > 0
    ) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/wizard-project-creator", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectName: wizardData.projectInfo.name,
            description: wizardData.projectInfo.description,
            industries: wizardData.projectInfo.industries,
            projectPlatforms: wizardData.projectInfo.projectPlatforms,
          }),
        });

        const data = await response.json();
        if (data.projects) {
          setSuggestedProjects(data.projects);
          setHasCalledProjectsAI(true);
          setWizardData((prev) => ({
            ...prev,
            projects: data.projects,
          }));
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    }

    // Only proceed to next step if we have features selected after AI call
    if (
      currentStep === 3 &&
      hasCalledProjectsAI &&
      (!wizardData.projects || wizardData.projects.length === 0)
    ) {
      return;
    }

    // Proceed to next step
    if (currentStep < 7) {
      // Don't automatically increment step if we're calling industry-competitors AI
      if (!(currentStep === 2 && !hasCalledIndustryCompetitorsAI)) {
        setCurrentStep(currentStep + 1);
      }

      if (currentStep === 2) {
        setHasCalledAI(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      // Store current state before going back
      setPreviousData({ ...wizardData });

      // Special handling for GitHub import step
      if (currentStep === 1.5) {
        setCurrentStep(1); // Go back to project type selection
        return;
      }

      // Special handling when going back from industry selection (step 3)
      // to either project info (step 2) or GitHub import (step 1.5)
      if (
        currentStep === 3 &&
        wizardData.projectType === "existing" &&
        wizardData.githubRepository
      ) {
        setCurrentStep(1.5);
        return;
      }

      setCurrentStep(currentStep - 1);
    }
  };

  const handleProjectTypeChange = (type: ProjectType) => {
    setWizardData((prev) => ({
      ...prev,
      projectType: type,
    }));
  };

  const handleProjectInfoChange = (info: {
    name: string;
    description: string;
    industries: string[];
    projectPlatforms: { value: string; isCore?: boolean }[];
  }) => {
    const hasSignificantChanges =
      info.name !== wizardData.projectInfo?.name ||
      info.description !== wizardData.projectInfo?.description ||
      JSON.stringify(info.projectPlatforms) !==
        JSON.stringify(wizardData.projectInfo?.projectPlatforms);

    if (hasSignificantChanges) {
      setHasCalledAI(false);
      setHasCalledIndustryCompetitorsAI(false);
      setHasCalledProjectsAI(false);
      setSuggestedIndustries([]);
      setSuggestedCompetitors([]);
      setSuggestedProjects([]);
    }

    setWizardData((prev) => ({
      ...prev,
      projectInfo: info,
    }));
  };

  const handleCompetitorsChange = (competitors: Competitor[]) => {
    setWizardData((prev) => ({
      ...prev,
      competitors,
    }));
  };

  const handleProjectsChange = (projects: GeneratedProject[]) => {
    setWizardData((prev) => ({
      ...prev,
      projects,
    }));
  };

  const handleLeaderChange = (leader: Lead | null) => {
    setWizardData((prev) => ({
      ...prev,
      leader,
    }));
  };

  const handleIndustriesChange = (industries: string[]) => {
    setWizardData((prev) => ({
      ...prev,
      projectInfo: {
        ...prev.projectInfo!,
        industries,
      },
    }));
  };

  const handleGitHubImport = (repository: any) => {
    // If repository name is available, prefill project info
    if (repository.name) {
      setWizardData((prev) => ({
        ...prev,
        githubRepository: repository,
        projectInfo: {
          ...prev.projectInfo!,
          name: repository.name,
          description:
            repository.description || prev.projectInfo?.description || "",
        },
      }));
    } else {
      setWizardData((prev) => ({
        ...prev,
        githubRepository: repository,
      }));
    }
  };

  const handleBookMeeting = () => {
    // This will be implemented by the user for calendar functionality
    console.log("Book meeting clicked for:", wizardData.leader?.name);
    setHasBookedMeeting(true);
    // You can add your calendar integration here
  };

  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      return !!wizardData.projectType;
    } else if (currentStep === 1.5) {
      // Can proceed from GitHub import if a repo is selected
      return !!wizardData.githubRepository;
    } else if (currentStep === 2) {
      if (!hasCalledIndustryCompetitorsAI) {
        const hasPlatforms =
          (wizardData.projectInfo?.projectPlatforms.length ?? 0) > 0;

        return !!wizardData.projectInfo?.name && hasPlatforms;
      }
      return true;
    } else if (currentStep === 3) {
      return (
        wizardData.projectInfo?.industries &&
        wizardData.projectInfo.industries.length > 0 &&
        wizardData.competitors.length > 0
      );
    } else if (currentStep === 4) {
      if (!hasCalledProjectsAI) {
        return wizardData.competitors.length > 0;
      } else {
        return wizardData.projects.length > 0;
      }
    } else if (currentStep === 5) {
      return !!wizardData.leader;
    } else if (currentStep === 6) {
      return !!wizardData.leader && hasBookedMeeting; // Require both TPM selection and booking
    }
    return true;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="flex flex-col gap-4 w-full">
            <WizardSteps />
            {/* <WizardVideoPreview /> */}
          </div>
        );
      case 1:
        return (
          <div className="col-span-2">
            <ProjectTypeComponent
              onProjectTypeChange={handleProjectTypeChange}
              selectedType={wizardData.projectType}
            />
          </div>
        );
      case 1.5: // GitHub Import step
        return (
          <div className="col-span-2">
            <GitHubImport
              userid={userid}
              token={token}
              onImportComplete={handleGitHubImport}
            />
          </div>
        );
      case 2:
        return (
          <div className="col-span-2">
            <ProjectInfo
              onProjectInfoChange={handleProjectInfoChange}
              isLoading={isLoading}
              suggestedIndustries={[]}
            />
          </div>
        );
      case 3:
        return (
          <div className="col-span-2">
            <IndustryCompetitors
              projectInfo={wizardData.projectInfo!}
              onIndustriesChange={handleIndustriesChange}
              onCompetitorsChange={handleCompetitorsChange}
              isLoading={isLoading}
              suggestedIndustries={suggestedIndustries}
              suggestedCompetitors={suggestedCompetitors}
              selectedIndustries={wizardData.projectInfo?.industries || []}
              selectedCompetitors={wizardData.competitors}
            />
          </div>
        );
      case 4:
        return (
          <div className="col-span-2">
            <ProjectGenerator
              projectInfo={wizardData.projectInfo!}
              onProjectsChange={handleProjectsChange}
              isLoading={isLoading}
              suggestedProjects={suggestedProjects}
            />
          </div>
        );
      case 5:
        return (
          <div className="col-span-2">
            <ProjectLeader
              onLeaderChange={handleLeaderChange}
              selectedLeader={wizardData.leader}
            />
          </div>
        );
      case 6:
        return (
          <div className="col-span-2">
            {wizardData.leader ? (
              <TpmDetails
                selectedLeader={wizardData.leader}
                onBookMeeting={handleBookMeeting}
                hasBookedMeeting={hasBookedMeeting}
              />
            ) : (
              <div className="text-center text-white">
                No Technical Product Manager selected
              </div>
            )}
          </div>
        );
      case 7:
        return (
          <div className="col-span-2">
            <ProjectTimeline
              features={wizardData.projects}
              onFeaturesChange={handleProjectsChange}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col overflow-x-hidden w-full">
      {isLoading && <LoadingOverlay step={currentStep} />}
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col w-full">
        <WizardLogo />
        <div className="p-2 border border-darkPrimary/20 rounded-xl w-full">
          <div className="mx-auto flex-1 flex flex-col border-2 border-darkPrimary/40 p-9 rounded-xl w-full">
            <StepIndicator currentStep={currentStep} totalSteps={7} />

            <div
              className={cn(
                "flex-1 pb-24 w-full",
                currentStep === 0
                  ? "flex flex-col" // For step 0, use flex column layout
                  : "grid md:grid-cols-2 gap-12" // For other steps, use grid
              )}
            >
              {renderStep()}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/80 backdrop-blur-md border-t border-darkPrimary/20 py-4 z-20">
        <div className="max-w-[100vw] w-full mx-auto px-4 flex justify-end gap-4 overflow-x-hidden">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="px-6 py-2.5 text-sm"
            >
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceedToNextStep() || isLoading}
            className="px-6 py-2.5 text-sm dark:bg-darkPrimary bg-darkPrimary hover:dark:bg-darkPrimary/90 hover:text-white dark:text-black text-black rounded-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : currentStep === 6 ? (
              hasBookedMeeting ? (
                "Create Your Project Draft"
              ) : (
                "Next"
              )
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
