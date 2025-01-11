import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-1 rounded-full transition-all duration-300",
            index < currentStep
              ? "bg-primary2 w-12"
              : index === currentStep
              ? "bg-primary2/50 w-12"
              : "bg-[#141414] w-12"
          )}
        />
      ))}
    </div>
  );
} 