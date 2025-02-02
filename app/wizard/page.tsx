"use client";

import { useState } from "react";
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

interface Industry {
  label: string;
  value: string;
}

interface Competitor {
  name: string;
  url: string;
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

export default function Wizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedIndustries, setSuggestedIndustries] = useState<Industry[]>(
    []
  );
  const [suggestedCompetitors, setSuggestedCompetitors] = useState<
    Competitor[]
  >([]);
  const [suggestedFeatures, setSuggestedFeatures] = useState<Feature[]>([]);
  const [wizardData, setWizardData] = useState<WizardData>({
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
  });
  const [hasCalledAI, setHasCalledAI] = useState(false);
  const [hasCalledCompetitorsAI, setHasCalledCompetitorsAI] = useState(false);
  const [hasCalledFeaturesAI, setHasCalledFeaturesAI] = useState(false);

  const handleNext = async () => {
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
        }
        // Move to next step after getting AI suggestions
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error("Error fetching industries:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Call competitors AI when moving from step 1 to 2
    if (
      currentStep === 2 &&
      hasCalledAI &&
      !hasCalledCompetitorsAI &&
      wizardData.projectInfo
    ) {
      setIsLoading(true);
      try {
        console.log('Sending competitors API request:', {
          projectName: wizardData.projectInfo.name,
          description: wizardData.projectInfo.description,
          industries: wizardData.projectInfo.industries,
          industry: wizardData.projectInfo.industries[0],
        });

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
        console.log('Competitors API response:', data);

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
        }
      } catch (error) {
        console.error("Error fetching competitors:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Call features AI when moving from step 2 to 3
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
      currentStep === 2 &&
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
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProjectInfoChange = (info: {
    name: string;
    description: string;
    industries: string[];
    projectScope: ProjectScope;
    projectPlatforms: {
      value: string;
      isCore?: boolean;
    }[];
  }) => {
    setWizardData((prev) => ({
      ...prev,
      projectInfo: info,
    }));
    // Only reset AI state if name or description changes
    if (
      hasCalledAI &&
      (info.name !== wizardData.projectInfo?.name ||
        info.description !== wizardData.projectInfo?.description)
    ) {
      setHasCalledAI(false);
      setSuggestedIndustries([]);
    }
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
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
        <WizardLogo />
        <div className="p-2 border border-darkPrimary/20 rounded-xl">
          <div className="mx-auto flex-1 flex flex-col border-2 border-darkPrimary/40 p-9 rounded-xl">
            <StepIndicator currentStep={currentStep} totalSteps={6} />

            <div className="grid md:grid-cols-2 gap-12 flex-1">
              {renderStep()}
            </div>

            {/* Navigation */}
            <div className="flex justify-end gap-4 mt-8">
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
                disabled={!canProceedToNextStep()}
                className="px-6 py-2.5 text-sm bg-primary2 hover:bg-primary2/90 text-white rounded-lg"
              >
                {currentStep === 1 && !hasCalledAI
                  ? "Get AI Suggestions"
                  : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
