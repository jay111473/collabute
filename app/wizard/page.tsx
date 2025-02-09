"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WizardLogo } from "@/components/wizard/logo";
import { WizardSteps } from "@/components/wizard/steps";
import { WizardVideoPreview } from "@/components/wizard/video-preview";
import { StepIndicator } from "@/components/wizard/step-indicator";
import { ProjectInfo } from "@/components/wizard/project-info";
import { ProjectCompetitors } from "@/components/wizard/project-competitors";
import { ProjectFeatures } from "@/components/wizard/project-features";
import { ProjectTimeline } from "@/components/wizard/project-timeline";
import { ProjectScope, ProjectSide, Stack, Project, Feature } from "@/types/wizard";
import { ProjectLeader } from "@/components/wizard/project-leader";
import { IndustrySelection } from "@/components/wizard/industry-selection";
import { Loader2 } from "lucide-react";

interface Industry {
  label: string;
  value: string;
}

interface Competitor {
  name: string;
  url: string;
  slogan?: string;
  yearFounded?: number;
  businessScale?: 'Startup' | 'SMB' | 'Enterprise' | 'Global Enterprise';
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
  projectInfo: {
    name: string;
    description: string;
    industries: string[];
    projectScope: ProjectScope;
    projectPlatforms: {
      value: string;
      isCore?: boolean;
    }[];
  } | null;
  competitors: Competitor[];
  features: Feature[];
  leader: Lead | null;
}

function LoadingOverlay({ step }: { step: number }) {
  const getMessage = () => {
    switch (step) {
      case 1:
        return {
          title: "Analyzing Your Project",
          description: "Our AI is processing your project details to suggest relevant industries. This may take a few moments..."
        };
      case 2:
        return {
          title: "Finding Competitors",
          description: "Analyzing your industry and project scope to identify relevant competitors..."
        };
      case 3:
        return {
          title: "Generating Features",
          description: "Creating a comprehensive feature list based on your project requirements and competitor analysis..."
        };
      case 4:
        return {
          title: "Planning Development",
          description: "Organizing features and creating a development timeline..."
        };
      default:
        return {
          title: "Processing",
          description: "Please wait while we process your request..."
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
          <p className="text-sm text-gray-400">
            {message.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Wizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedIndustries, setSuggestedIndustries] = useState<Industry[]>([]);
  const [suggestedCompetitors, setSuggestedCompetitors] = useState<Competitor[]>([]);
  const [suggestedFeatures, setSuggestedFeatures] = useState<Feature[]>([]);
  const [wizardData, setWizardData] = useState<WizardData>(() => {
    // Try to load saved data from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wizardData');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved wizard data:', e);
        }
      }
    }
    // Default initial state
    return {
      projectInfo: {
        name: "",
        description: "",
        industries: [],
        projectScope: "unknown",
        projectPlatforms: [],
      },
      competitors: [],
      features: [],
      leader: null,
    };
  });
  const [hasCalledAI, setHasCalledAI] = useState(false);
  const [hasCalledCompetitorsAI, setHasCalledCompetitorsAI] = useState(false);
  const [hasCalledFeaturesAI, setHasCalledFeaturesAI] = useState(false);
  const [previousData, setPreviousData] = useState<WizardData | null>(null);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wizardData', JSON.stringify(wizardData));
  }, [wizardData]);

  // Load saved step if available
  useEffect(() => {
    const savedStep = localStorage.getItem('currentStep');
    if (savedStep) {
      setCurrentStep(parseInt(savedStep));
    }
  }, []);

  // Save current step
  useEffect(() => {
    localStorage.setItem('currentStep', currentStep.toString());
  }, [currentStep]);

  // Check if data has changed from previous state
  const hasDataChanged = (step: number) => {
    if (!previousData) return false;
    
    switch (step) {
      case 1:
        return (
          previousData.projectInfo?.name !== wizardData.projectInfo?.name ||
          previousData.projectInfo?.description !== wizardData.projectInfo?.description ||
          previousData.projectInfo?.projectScope !== wizardData.projectInfo?.projectScope ||
          JSON.stringify(previousData.projectInfo?.projectPlatforms) !== 
          JSON.stringify(wizardData.projectInfo?.projectPlatforms)
        );
      case 2:
        return JSON.stringify(previousData.projectInfo?.industries) !== 
               JSON.stringify(wizardData.projectInfo?.industries);
      case 3:
        return JSON.stringify(previousData.competitors) !== 
               JSON.stringify(wizardData.competitors);
      case 4:
        return JSON.stringify(previousData.features) !== 
               JSON.stringify(wizardData.features);
      case 5:
        return JSON.stringify(previousData.leader) !== 
               JSON.stringify(wizardData.leader);
      default:
        return false;
    }
  };

  const handleNext = async () => {
    // Store current state before processing
    setPreviousData({ ...wizardData });

    // Reset AI states if data has changed
    if (hasDataChanged(currentStep)) {
      if (currentStep === 1) setHasCalledAI(false);
      if (currentStep === 2) setHasCalledCompetitorsAI(false);
      if (currentStep === 3) setHasCalledFeaturesAI(false);
    }

    // If we're on step 1 and haven't called AI yet but have valid inputs
    if (
      currentStep === 1 &&
      !hasCalledAI &&
      wizardData.projectInfo?.name &&
      wizardData.projectInfo?.description
    ) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/wizard-industry-ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: `Project Name: ${wizardData.projectInfo.name}\nDescription: ${wizardData.projectInfo.description}`,
          }),
        });

        const data = await response.json();
        setSuggestedIndustries(data.industries);
        setHasCalledAI(true);

        // Set all suggested industries
        if (data.industries?.length > 0) {
          setWizardData((prev) => ({
            ...prev,
            projectInfo: {
              ...prev.projectInfo!,
              industries: data.industries.map(
                (industry: Industry) => industry.value
              ),
            },
          }));
          // Move to next step after getting AI suggestions
          setCurrentStep(currentStep + 1);
        }
      } catch (error) {
        console.error("Error fetching industries:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Call competitors AI when moving from step 2 to 3
    if (
      currentStep === 2 &&
      wizardData.projectInfo?.industries &&
      wizardData.projectInfo.industries.length > 0
    ) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/wizard-competitors-ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectName: wizardData.projectInfo.name,
            description: wizardData.projectInfo.description,
            industries: wizardData.projectInfo.industries,
            industry: wizardData.projectInfo.industries[0],
          }),
        });

        const data = await response.json();

        if (data.error) {
          console.error('Competitors API error:', data.error, data.missingFields);
          return;
        }

        if (data.competitors?.length > 0) {
          setSuggestedCompetitors(data.competitors);
          setHasCalledCompetitorsAI(true);
          setWizardData((prev) => ({
            ...prev,
            competitors: data.competitors,
          }));
          // Move to next step after getting competitors
          setCurrentStep(currentStep + 1);
        }
      } catch (error) {
        console.error("Error fetching competitors:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Call features AI when moving from step 3 to 4
    if (
      currentStep === 3 &&
      !hasCalledFeaturesAI &&
      wizardData.projectInfo &&
      wizardData.competitors.length > 0
    ) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/wizard-features-ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectName: wizardData.projectInfo.name,
            description: wizardData.projectInfo.description,
            industries: wizardData.projectInfo.industries,
            competitors: wizardData.competitors,
            projectPlatforms: wizardData.projectInfo.projectPlatforms,
            projectScope: wizardData.projectInfo.projectScope,
          }),
        });

        const data = await response.json();
        if (data.features) {
          setSuggestedFeatures(data.features);
          setHasCalledFeaturesAI(true);
          setWizardData((prev) => ({
            ...prev,
            features: data.features,
          }));
        }
      } catch (error) {
        console.error("Error fetching features:", error);
      } finally {
        setIsLoading(false);
      }
    }

    // Only proceed to next step if we have features selected after AI call
    if (
      currentStep === 3 &&
      hasCalledFeaturesAI &&
      (!wizardData.features || wizardData.features.length === 0)
    ) {
      return;
    }

    // Proceed to next step
    if (currentStep < 6) {
      // Don't automatically increment step if we're calling competitors AI
      if (!(currentStep === 2 && !hasCalledCompetitorsAI)) {
        setCurrentStep(currentStep + 1);
        if (currentStep === 1) {
          setHasCalledAI(false);
        }
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      // Store current state before going back
      setPreviousData({ ...wizardData });
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProjectInfoChange = (info: {
    name: string;
    description: string;
    industries: string[];
    projectScope: ProjectScope;
    projectPlatforms: { value: string; isCore?: boolean; }[];
  }) => {
    const hasSignificantChanges = 
      info.name !== wizardData.projectInfo?.name ||
      info.description !== wizardData.projectInfo?.description ||
      info.projectScope !== wizardData.projectInfo?.projectScope ||
      JSON.stringify(info.projectPlatforms) !== JSON.stringify(wizardData.projectInfo?.projectPlatforms);

    if (hasSignificantChanges) {
      setHasCalledAI(false);
      setHasCalledCompetitorsAI(false);
      setHasCalledFeaturesAI(false);
      setSuggestedIndustries([]);
      setSuggestedCompetitors([]);
      setSuggestedFeatures([]);
    }

    setWizardData(prev => ({
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

  const handleFeaturesChange = (features: Feature[]) => {
    setWizardData((prev) => ({
      ...prev,
      features,
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

  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      const wordCount =
        wizardData.projectInfo?.description?.trim().split(/\s+/).length || 0;

      if (!hasCalledAI) {
        const hasPlatforms =
          wizardData.projectInfo?.projectScope === "unknown" ||
          (wizardData.projectInfo?.projectPlatforms.length ?? 0) > 0;

        return (
          !!wizardData.projectInfo?.name &&
          wordCount >= 20 &&
          !!wizardData.projectInfo?.projectScope &&
          hasPlatforms
        );
      }
      return true;
    } else if (currentStep === 2) {
      return (
        wizardData.projectInfo?.industries &&
        wizardData.projectInfo.industries.length > 0
      );
    } else if (currentStep === 3) {
      if (!hasCalledFeaturesAI) {
        return wizardData.competitors.length > 0;
      } else {
        return wizardData.features.length > 0;
      }
    }
    return true;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <WizardSteps />
            <WizardVideoPreview />
          </>
        );
      case 1:
        return (
          <div className="col-span-2">
            <ProjectInfo
              onProjectInfoChange={handleProjectInfoChange}
              isLoading={isLoading}
              suggestedIndustries={[]}
            />
          </div>
        );
      case 2:
        return (
          <div className="col-span-2">
            <IndustrySelection
              onIndustriesChange={handleIndustriesChange}
              isLoading={isLoading}
              suggestedIndustries={suggestedIndustries}
              selectedIndustries={wizardData.projectInfo?.industries || []}
            />
          </div>
        );
      case 3:
        return (
          <div className="col-span-2">
            <ProjectCompetitors
              projectInfo={wizardData.projectInfo!}
              competitors={wizardData.competitors}
              onCompetitorsChange={handleCompetitorsChange}
              isLoading={isLoading}
              suggestedCompetitors={suggestedCompetitors}
            />
          </div>
        );
      case 4:
        return (
          <div className="col-span-2">
            <ProjectFeatures
              projectInfo={wizardData.projectInfo!}
              competitors={wizardData.competitors}
              onFeaturesChange={handleFeaturesChange}
              isLoading={isLoading}
              suggestedFeatures={suggestedFeatures}
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
            <ProjectTimeline
              features={wizardData.features}
              onFeaturesChange={handleFeaturesChange}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {isLoading && <LoadingOverlay step={currentStep} />}
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
        <WizardLogo />
        <div className="p-2 border border-darkPrimary/20 rounded-xl">
          <div className="mx-auto flex-1 flex flex-col border-2 border-darkPrimary/40 p-9 rounded-xl">
            <StepIndicator currentStep={currentStep} totalSteps={6} />

            <div className="grid md:grid-cols-2 gap-12 flex-1 pb-24">
              {renderStep()}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/80 backdrop-blur-md border-t border-darkPrimary/20 py-4">
        <div className="container mx-auto px-4 flex justify-end gap-4">
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
            className="px-6 py-2.5 text-sm bg-primary2 hover:bg-primary2/90 text-white rounded-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
