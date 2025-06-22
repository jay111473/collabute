"use client";

import { LoadingOverlay } from "@/components/wizard/loading-overlay";
import { WizardStepRenderer } from "@/components/wizard/wizard-step-renderer";
import { WizardNavigation } from "@/components/wizard/wizard-navigation";
import { SubscriptionPopup } from "@/components/wizard/subscription-popup";
import { ProgressIndicator } from "@/components/wizard/progress-indicator";
import { GitHubAccessVerification } from "@/components/wizard/github-access-verification";
import { useWizardFlow } from "./hooks/use-wizard-flow";
import { getCookie } from "cookies-next";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Wizard() {
  const userid = getCookie("userid") as string;
  const token = getCookie("token") as string;
  const [isGitHubAccessVerified, setIsGitHubAccessVerified] = useState(false);

  const {
    // Data
    wizardData,
    hasBookedMeeting,
    showSubscriptionPopup,

    // Navigation
    currentStep,
    canProceedToNextStep,
    goToPreviousStep,

    // AI
    isLoading,
    suggestedIndustries,
    suggestedCompetitors,
    suggestedProjects,
    suggestedTracks,
    totalEstimatedDuration,
    criticalPath,
    parallelizationOpportunities,

    // GitHub Access
    gitHubAccess,

    // Handlers
    handleNext,
    handleBookMeeting,
    handleSubscriptionChoice,
    handleCloseSubscriptionPopup,

    // Data update functions
    updateProjectType,
    updateProjectInfo,
    updateProjects,
    updateTracks,
    updateLeader,
    updateGitHubRepository,
    retryBusinessComparison,
    retryFeatureComparison,
  } = useWizardFlow(userid);

  // If no userid, show error or redirect to auth
  if (!userid) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center text-white">
          <p>Please log in to access the wizard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col overflow-x-hidden w-full">
      {isLoading && <LoadingOverlay step={currentStep} />}

      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col w-full">
        <div className="p-2 w-full">
          <div className="mx-auto flex-1 flex flex-col p-9 rounded-xl w-full">
            <GitHubAccessVerification
              userId={userid}
              onAccessVerified={() => setIsGitHubAccessVerified(true)}
            >
              {/* Progress Indicator - Hide on step 0 */}
              {currentStep > 0 && (
                <ProgressIndicator currentStep={currentStep} className="mb-8" />
              )}

              <div
                className={cn(
                  "flex-1 pb-24 w-full",
                  currentStep === 0
                    ? "flex flex-col"
                    : "grid md:grid-cols-2 gap-12"
                )}
              >
                <WizardStepRenderer
                  currentStep={currentStep}
                  wizardData={wizardData}
                  isLoading={isLoading}
                  canProceed={canProceedToNextStep()}
                  suggestedIndustries={suggestedIndustries}
                  suggestedCompetitors={suggestedCompetitors}
                  suggestedTracks={suggestedTracks}
                  userid={userid}
                  token={token}
                  hasBookedMeeting={hasBookedMeeting}
                  onNext={handleNext}
                  onProjectTypeChange={updateProjectType}
                  onProjectInfoChange={updateProjectInfo}
                  onProjectsChange={updateProjects}
                  onTracksChange={updateTracks}
                  onLeaderChange={updateLeader}
                  onGitHubImport={updateGitHubRepository}
                  onBookMeeting={handleBookMeeting}
                  onRetryBusinessComparison={retryBusinessComparison}
                  onRetryFeatureComparison={retryFeatureComparison}
                />
              </div>
            </GitHubAccessVerification>
          </div>
        </div>
      </div>

      {/* Only show navigation if GitHub access is verified */}
      {isGitHubAccessVerified && (
        <WizardNavigation
          currentStep={currentStep}
          canProceed={canProceedToNextStep()}
          isLoading={isLoading}
          hasBookedMeeting={hasBookedMeeting}
          onNext={handleNext}
          onBack={goToPreviousStep}
        />
      )}

      <SubscriptionPopup
        isOpen={showSubscriptionPopup}
        onClose={handleCloseSubscriptionPopup}
        onSubscribe={(plan) => handleSubscriptionChoice(plan)}
        onContinueLimited={() => handleSubscriptionChoice("limited")}
      />
    </div>
  );
}
