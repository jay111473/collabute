import { FileText, Users, Zap } from "lucide-react";
import { WizardWelcome } from "./welcome";
import { cn } from "@/lib/utils";

interface StepProps {
  number: number;
  title: string;
  description: string;
}

function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-darkPrimary/20 flex items-center justify-center text-darkPrimary font-semibold">
        {number}
      </div>
      <div>
        <h3 className="text-lg md:text-xl font-medium text-white">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}

export function WizardSteps() {
  return (
    <div className="space-y-8 p-4">
      <div className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Project Wizard</h2>
        <p className="text-gray-400">
          Follow these steps to create your project outline and get matched with the perfect development team.
        </p>
      </div>

      <div className="space-y-6">
        <Step
          number={1}
          title="Project Type"
          description="Tell us if you're working with an existing project or starting a new idea."
        />
        <Step
          number={2}
          title="Project Information"
          description="Provide basic details about your project and its scope."
        />
        <Step
          number={3}
          title="Industry Selection"
          description="Select industries relevant to your project."
        />
        <Step
          number={4}
          title="Competitor Analysis"
          description="Identify key competitors to benchmark against."
        />
        <Step
          number={5}
          title="Feature Planning"
          description="Define the core features for your project."
        />
        <Step
          number={6}
          title="Team Selection"
          description="Choose your project lead and team composition."
        />
        <Step
          number={7}
          title="Timeline & Budget"
          description="Review development timeline and budget allocation."
        />
      </div>
    </div>
  );
}
