"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CreateAccount from "@/components/auth/components/create-account";
import { Toaster } from "sonner";
// Step indicator component
const StepIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            index < currentStep
              ? "bg-accent w-8"
              : index === currentStep
              ? "bg-accent/50 w-8"
              : "bg-[#141414] w-8"
          )}
        />
      ))}
    </div>
  );
};

// Welcome step content
const WelcomeStep = ({ onNext }: { onNext: () => void }) => (
  <>
    {/* Logo */}
    <div className="relative w-24 h-24 mb-2">
      <Image
        src="/logo.svg"
        alt="Collabute Logo"
        fill
        className="rounded-md"
        priority
      />
    </div>

    {/* Welcome Text */}
    <h1 className="text-5xl font-bold text-center w-full break-words">
      Welcome to Collabute
    </h1>

    {/* Description */}
    <div className="text-center text-zinc-400 space-y-2 w-full">
      <p className="text-sm">
        Collabute is an AI driven solution for startups to build and launch
        products faster and <br /> it helps developers to find their next
        opportunity.
      </p>
    </div>

    {/* Get Started Button */}
    <Button
      variant="primary"
      size="lg"
      className="w-[200px] mt-8"
      onClick={onNext}
    >
      Get started
    </Button>
  </>
);

// Account setup step content
const AccountSetupStep = ({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add event listener for form error
  useEffect(() => {
    const formElement = formRef.current;

    const handleFormError = () => {
      setIsSubmitting(false);
    };

    if (formElement) {
      formElement.addEventListener("form:error", handleFormError);
    }

    return () => {
      if (formElement) {
        formElement.removeEventListener("form:error", handleFormError);
      }
    };
  }, [formRef]);

  const handleContinue = () => {
    // Set loading state
    setIsSubmitting(true);

    // Submit the form programmatically
    if (formRef.current) {
      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      formRef.current.dispatchEvent(submitEvent);

      // If the form submission fails, we need to reset the loading state
      // This timeout is a fallback in case the onSuccessfulSubmit is never called
      setTimeout(() => {
        setIsSubmitting(false);
      }, 5000);
    } else {
      setIsSubmitting(false);
    }
  };

  const handleFormSuccess = () => {
    setIsSubmitting(false);
    onNext();
  };

  return (
    <>
      <Toaster />
      {/* Logo */}
      <div className="relative w-16 h-16 mb-2">
        <Image
          src="/logo.svg"
          alt="Collabute Logo"
          fill
          className="rounded-md"
          priority
        />
      </div>

      {/* Step Title */}
      <h1 className="text-3xl font-bold text-center w-full break-words">
        Set up your account
      </h1>

      {/* Description */}
      <div className="text-center text-zinc-400 space-y-2 w-full">
        <p className="text-sm">
          Tell us a bit about yourself so we can personalize your experience.
        </p>
      </div>

      {/* Form would go here */}
      <div className="w-full flex justify-center items-center mt-6">
        <CreateAccount
          formRef={formRef}
          onSuccessfulSubmit={handleFormSuccess}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-8">
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleContinue}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </>
  );
};

// Preferences step content
const PreferencesStep = ({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) => (
  <>
    {/* Logo */}
    <div className="relative w-16 h-16 mb-2">
      <Image
        src="/logo.svg"
        alt="Collabute Logo"
        fill
        className="rounded-md"
        priority
      />
    </div>

    {/* Step Title */}
    <h1 className="text-3xl font-bold text-center w-full break-words">
      Your preferences
    </h1>

    {/* Description */}
    <div className="text-center text-zinc-400 space-y-2 w-full">
      <p className="text-sm">Help us understand your interests and goals.</p>
    </div>

    {/* Preferences would go here */}
    <div className="w-full max-w-md mt-6 space-y-4">
      {/* This is a placeholder for the actual preferences selection */}
      <div className="h-32 bg-[#141414] rounded-md flex items-center justify-center">
        <p className="text-zinc-400">Preferences selection will go here</p>
      </div>
    </div>

    {/* Navigation Buttons */}
    <div className="flex gap-4 mt-8">
      <Button variant="outline" size="lg" onClick={onBack}>
        Back
      </Button>
      <Button variant="primary" size="lg" onClick={onNext}>
        Continue
      </Button>
    </div>
  </>
);

// Complete step content
const CompleteStep = ({ onFinish }: { onFinish: () => void }) => (
  <>
    {/* Logo */}
    <div className="relative w-16 h-16 mb-2">
      <Image
        src="/logo.svg"
        alt="Collabute Logo"
        fill
        className="rounded-md"
        priority
      />
    </div>

    {/* Step Title */}
    <h1 className="text-3xl font-bold text-center w-full break-words">
      You&apos;re all set!
    </h1>

    {/* Description */}
    <div className="text-center text-zinc-400 space-y-2 w-full">
      <p className="text-sm">
        Your account has been set up successfully. You&apos;re ready to start
        using Collabute.
      </p>
    </div>

    {/* Success Icon */}
    <div className="mt-6 mb-6">
      <div className="w-20 h-20 bg-purple/20 rounded-full flex items-center justify-center mx-auto">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 6L9 17L4 12"
            stroke="#A855F7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>

    {/* Finish Button */}
    <Button
      variant="primary"
      size="lg"
      className="w-[200px] mt-4"
      onClick={onFinish}
    >
      Go to dashboard
    </Button>
  </>
);

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    // Navigate to dashboard or home page
    window.location.href = "/dashboard";
  };

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />;
      case 1:
        return <AccountSetupStep onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <PreferencesStep onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <CompleteStep onFinish={handleFinish} />;
      default:
        return <WelcomeStep onNext={handleNext} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-white p-4">
      <div className="w-full max-w-2xl flex flex-col items-center space-y-8">
        {renderStepContent()}
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      </div>
    </div>
  );
};

export default Onboarding;
