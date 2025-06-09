import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  step: number;
}

const getLoadingMessage = (step: number) => {
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

export function LoadingOverlay({ step }: LoadingOverlayProps) {
  const message = getLoadingMessage(step);

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