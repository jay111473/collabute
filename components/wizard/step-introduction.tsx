import { motion } from "framer-motion";
import { 
  Lightbulb, 
  BarChart3, 
  Users, 
  GitBranch, 
  Rocket, 
  UserCheck, 
  Calendar, 
  ArrowRight,
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
    description: "Tell us about your project idea. Our AI will help refine it and understand your vision, whether you have a detailed concept or just a spark of inspiration.",
    benefits: [
      "AI-powered idea refinement and clarification",
      "Industry and platform recommendations",
      "Instant feedback on feasibility and market fit"
    ],
    nextStep: "We'll analyze your idea against market leaders"
  },
  1: {
    icon: BarChart3,
    title: "Business Model Analysis",
    subtitle: "See how your idea compares to market leaders",
    description: "Our AI analyzes your concept against successful companies in your space, identifying key business aspects and competitive advantages.",
    benefits: [
      "Compare with established market players",
      "Identify unique value propositions",
      "Understand business model strengths"
    ],
    nextStep: "We'll dive into feature comparisons"
  },
  2: {
    icon: Target,
    title: "Feature Comparison",
    subtitle: "Understand your competitive landscape",
    description: "Deep dive into how your features stack up against competitors. Identify gaps, opportunities, and areas where you can differentiate.",
    benefits: [
      "Feature-by-feature competitor analysis",
      "Identify market gaps and opportunities",
      "Strategic positioning insights"
    ],
    nextStep: "We'll create your development roadmap"
  },
  3: {
    icon: GitBranch,
    title: "Development Tracks",
    subtitle: "Plan your technical implementation",
    description: "Break down your project into manageable development tracks. Each track represents a specialized area of work that can be tackled by expert developers.",
    benefits: [
      "Organized development workflow",
      "Clear technical requirements",
      "Parallel development opportunities"
    ],
    nextStep: "We'll generate specific project components"
  },
  4: {
    icon: Rocket,
    title: "Project Generation",
    subtitle: "Create detailed project specifications",
    description: "Transform your tracks into specific, actionable projects that developers can bid on. Each project includes clear requirements, timelines, and deliverables.",
    benefits: [
      "Developer-ready project specifications",
      "Accurate time and cost estimates",
      "Clear deliverables and milestones"
    ],
    nextStep: "We'll help you find the right team leader"
  },
  5: {
    icon: UserCheck,
    title: "Technical Leadership",
    subtitle: "Choose your Technical Product Manager",
    description: "Select an experienced Technical Product Manager who will oversee your project, coordinate with developers, and ensure quality delivery.",
    benefits: [
      "Expert project oversight",
      "Quality assurance and code reviews",
      "Direct communication and updates"
    ],
    nextStep: "We'll schedule your kickoff meeting"
  },
  6: {
    icon: Users,
    title: "Team Coordination",
    subtitle: "Meet your Technical Product Manager",
    description: "Connect with your chosen TPM to discuss project details, timeline, and expectations. This is where your project officially begins.",
    benefits: [
      "Personal project consultation",
      "Customized development strategy",
      "Clear communication channels"
    ],
    nextStep: "We'll finalize your project timeline"
  },
  7: {
    icon: Calendar,
    title: "Project Timeline",
    subtitle: "Finalize your development roadmap",
    description: "Review and approve your complete project timeline. See how all components work together and when you can expect deliverables.",
    benefits: [
      "Complete project visualization",
      "Milestone tracking and deadlines",
      "Resource allocation overview"
    ],
    nextStep: "Your project goes live on our marketplace!"
  }
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
      <div className="flex items-center gap-4">
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

        {/* Right: Next Step Preview */}
        <div className="flex items-center gap-3 flex-shrink-0 px-4 py-3 bg-zinc-800/50 rounded-lg border border-zinc-700/30">
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-1">Next Step</div>
            <div className="text-sm text-gray-300 font-medium">{data.nextStep}</div>
          </div>
          <ArrowRight className="w-4 h-4 text-primary2" />
        </div>
      </div>
    </motion.div>
  );
} 