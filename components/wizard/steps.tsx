import { FileText, Users, Zap } from "lucide-react";
import { WizardWelcome } from "./welcome";

interface Step {
  title: string;
  description: string;
  subDescription: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    title: "Sketch Your Vision, We'll Fill in the Gaps",
    description:
      "Paint your big picture and let our wizard turn it into actionable goals.",
    subDescription:
      "Sit back as AI structures your tasks, smooths out workflows, and clarifies your plan.",
    icon: <FileText className="w-4 h-4 text-primary2" />,
  },
  {
    title: "Team Up & Build Big",
    description: "Meet your perfect developer match from our global community.",
    subDescription:
      "Stay in sync with GitHub-powered updates, commits, and real-time tracking.",
    icon: <Users className="w-4 h-4 text-primary2" />,
  },
  {
    title: "Begin. Pivot. Win",
    description: "Crush milestones, adapt fast, and keep innovation alive.",
    subDescription:
      "Take your idea to market with speed, agility, and endless possibilities.",
    icon: <Zap className="w-4 h-4 text-primary2" />,
  },
];

export function WizardSteps() {
  return (
    <div className="relative">
      <WizardWelcome />

      {/* Vertical Line */}
      <div className="absolute left-4 top-32 bottom-4 w-[1px] bg-[#d7d4d4]" />

      {/* Steps */}
      <div className="space-y-10 relative">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex-shrink-0 relative">
              {/* Step Circle */}
              <div className="w-8 h-8 bg-[#141414] rounded-lg flex items-center justify-center relative z-10">
                {step.icon}
              </div>
              {/* Active Step Indicator */}
              {index === 0 && (
                <div className="absolute left-4 top-4 w-[1px] h-12 bg-primary2" />
              )}
            </div>
            <div>
              <h3 className="text-md font-semibold mb-1.5 text-white">
                {step.title}
              </h3>
              <p className="text-xs mb-1.5 text-gray-400">{step.description}</p>
              <p className="text-xs text-gray-400">{step.subDescription}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
