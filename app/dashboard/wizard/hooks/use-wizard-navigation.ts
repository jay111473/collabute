import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { WizardData } from "@/types/wizard";

export function useWizardNavigation(wizardData: WizardData, hasBookedMeeting: boolean = false) {
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");

  const getInitialStep = (): number => {
    if (stepParam) {
      const parsedStep = parseFloat(stepParam);
      return !isNaN(parsedStep) ? parsedStep : 0;
    }
    return 0;
  };

  const [currentStep, setCurrentStep] = useState<number>(getInitialStep());

  // Update URL when step changes
  useEffect(() => {
    if (stepParam && parseFloat(stepParam) === currentStep) {
      return;
    }
    updateStepInUrl(currentStep);
  }, [currentStep]);

  // Handle GitHub auth success
  useEffect(() => {
    const githubAuthSuccess = searchParams.get("github_auth_success");
    if (githubAuthSuccess === "true") {
      const step = searchParams.get("step") || "1.5";
      setCurrentStep(parseFloat(step));

      // Clean up URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("github_auth_success");
      const url = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({ path: url }, "", url);
    }
  }, [searchParams]);

  const updateStepInUrl = (step: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", step.toString());
    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ path: url }, "", url);
  };

  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 0:
        return !!wizardData.projectInfo?.idea;
      case 1:
        return !!wizardData.businessComparison; // BusinessComparison step
      case 2:
        return !!(
          wizardData.competitors.length > 0 &&
          wizardData.featureComparison
        ); // FeatureComparison step
      case 3:
        return wizardData.tracks.length > 0; // ProjectTracks step
      case 4:
        return wizardData.projects.length > 0; // ProjectGenerator step
      case 5:
        return !!wizardData.leader;
      case 6:
        return !!wizardData.leader && hasBookedMeeting;
      default:
        return true;
    }
  };

  const getNextStep = (): number => {
    return currentStep + 1;
  };

  const getPreviousStep = (): number => {
    return currentStep - 1;
  };

  const goToNextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(getNextStep());
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(getPreviousStep());
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  return {
    currentStep,
    canProceedToNextStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
  };
} 