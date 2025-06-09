import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardNavigationProps {
  currentStep: number;
  canProceed: boolean;
  isLoading: boolean;
  hasBookedMeeting: boolean;
  onNext: () => void;
  onBack: () => void;
}

export function WizardNavigation({
  currentStep,
  canProceed,
  isLoading,
  hasBookedMeeting,
  onNext,
  onBack,
}: WizardNavigationProps) {
  const getNextButtonText = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      );
    }

    if (currentStep === 5) {
      return hasBookedMeeting ? "Create Your Project Draft" : "Next";
    }

    return "Next";
  };

  // For step 0 (project info), don't show navigation since enter button is integrated
  if (currentStep === 0) {
    return null;
  }

  // For other steps, show clean navigation bar
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md border-t border-white/10 py-6 z-20">
      <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
        {currentStep > 0 ? (
          <Button
            variant="outline"
            onClick={onBack}
            className="px-6 py-2.5 text-sm bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/30"
          >
            Back
          </Button>
        ) : (
          <div />
        )}
        
        <Button
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className={cn(
            "px-8 py-2.5 text-sm rounded-lg font-medium",
            "bg-gradient-to-r from-primary2 to-darkPrimary",
            "hover:from-primary2/90 hover:to-darkPrimary/90",
            "text-white shadow-[0_0_15px_rgba(123,97,255,0.3)]",
            "hover:shadow-[0_0_20px_rgba(123,97,255,0.4)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-300"
          )}
        >
          {getNextButtonText()}
        </Button>
      </div>
    </div>
  );
} 