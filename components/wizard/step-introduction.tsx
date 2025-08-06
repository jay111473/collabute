import { motion } from "framer-motion";
import {
  Lightbulb,
  BarChart3,
  Users,
  GitBranch,
  Rocket,
  UserCheck,
  Calendar,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIntroductionProps {
  step: number;
  className?: string;
}

const stepData = {
  0: {
    icon: Lightbulb,
    title: "Share Your Vision",
    subtitle: "Transform your idea into a clear product concept",
    description:
      "Share your project idea and our AI will help refine your vision.",
    benefits: [
      "AI-powered idea refinement and clarification",
      "Industry and platform recommendations",
      "Instant feedback on feasibility and market fit",
    ],
  },
  1: {
    icon: BarChart3,
    title: "Business Model Analysis",
    subtitle: "See how your idea compares to market leaders",
    description: "AI analyzes your concept against market leaders.",
    benefits: [
      "Compare with established market players",
      "Identify unique value propositions",
      "Understand business model strengths",
    ],
  },
  2: {
    icon: Target,
    title: "Feature Comparison",
    subtitle: "Understand your competitive landscape",
    description:
      "Compare features with competitors and identify opportunities.",
    benefits: [
      "Feature-by-feature competitor analysis",
      "Identify market gaps and opportunities",
      "Strategic positioning insights",
    ],
  },
  3: {
    icon: GitBranch,
    title: "Development Tracks",
    subtitle: "Plan your technical implementation",
    description: "Organize your project into manageable development tracks.",
    benefits: [
      "Organized development workflow",
      "Clear technical requirements",
      "Parallel development opportunities",
    ],
  },
  4: {
    icon: Rocket,
    title: "Project Generation",
    subtitle: "Create detailed project specifications",
    description:
      "Create actionable projects with clear requirements and timelines.",
    benefits: [
      "Developer-ready project specifications",
      "Accurate time and cost estimates",
      "Clear deliverables and milestones",
    ],
  },
  5: {
    icon: UserCheck,
    title: "Technical Leadership",
    subtitle: "Choose your Technical Product Manager",
    description:
      "Choose a TPM to oversee your project and coordinate delivery.",
    benefits: [
      "Expert project oversight",
      "Quality assurance and code reviews",
      "Direct communication and updates",
    ],
  },
  6: {
    icon: Users,
    title: "Team Coordination",
    subtitle: "Meet your Technical Product Manager",
    description:
      "Connect with your TPM to discuss details and begin your project.",
    benefits: [
      "Personal project consultation",
      "Customized development strategy",
      "Clear communication channels",
    ],
  },
  7: {
    icon: Calendar,
    title: "Project Timeline",
    subtitle: "Finalize your development roadmap",
    description: "Review your complete timeline and expected deliverables.",
    benefits: [
      "Complete project visualization",
      "Milestone tracking and deadlines",
      "Resource allocation overview",
    ],
  },
};

export function StepIntroduction({ step, className }: StepIntroductionProps) {
  const data = stepData[step as keyof typeof stepData];

  if (!data) return null;

  const Icon = data.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 rounded-xl p-4 border border-zinc-700/50 backdrop-blur-sm",
        className
      )}
    >
      {/* Full Width Horizontal Layout */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Icon and Step Info */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary2/20 to-darkPrimary/20 flex items-center justify-center border border-primary2/30">
            <Icon className="w-5 h-5 text-primary2" />
          </div>
          <div>
            <span className="text-xs font-bold text-primary2 bg-primary2/10 px-2 py-1 rounded-full border border-primary2/20">
              STEP {step + 1}
            </span>
            <h2 className="text-lg font-bold text-white mt-1 leading-tight">
              {data.title}
            </h2>
          </div>
        </div>

        {/* Center: Main Content */}
        <div className="flex-1 min-w-0 px-4">
          <p className="text-gray-300 text-sm font-medium mb-1">
            {data.subtitle}
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            {data.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
