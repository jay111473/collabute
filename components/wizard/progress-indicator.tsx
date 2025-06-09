import React from "react";
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
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  className?: string;
}

const steps = [
  { icon: Lightbulb, label: "Vision", shortLabel: "Idea" },
  { icon: BarChart3, label: "Business Analysis", shortLabel: "Business" },
  { icon: Target, label: "Feature Comparison", shortLabel: "Features" },
  { icon: GitBranch, label: "Development Tracks", shortLabel: "Tracks" },
  { icon: Rocket, label: "Project Generation", shortLabel: "Projects" },
  { icon: UserCheck, label: "Technical Leadership", shortLabel: "Leader" },
  { icon: Users, label: "Team Coordination", shortLabel: "Team" },
  { icon: Calendar, label: "Project Timeline", shortLabel: "Timeline" }
];

export function ProgressIndicator({ currentStep, className }: ProgressIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Progress Bar */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-zinc-700/50 z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-primary2 to-darkPrimary"
              initial={{ width: "0%" }}
              animate={{ 
                width: currentStep === 0 ? "0%" : `${(currentStep / (steps.length - 1)) * 100}%` 
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;

            return (
              <div key={index} className="flex flex-col items-center relative z-20">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-[#0A0A0A]",
                    isCompleted && "bg-gradient-to-br from-primary2 to-darkPrimary border-primary2 shadow-lg shadow-primary2/30",
                    isCurrent && "bg-gradient-to-br from-primary2/20 to-darkPrimary/20 border-primary2 shadow-lg shadow-primary2/20",
                    isUpcoming && "bg-zinc-800/50 border-zinc-600/50"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className={cn(
                      "w-5 h-5",
                      isCurrent && "text-primary2",
                      isUpcoming && "text-zinc-400"
                    )} />
                  )}
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="mt-3 text-center"
                >
                  <div className={cn(
                    "text-xs font-medium transition-colors duration-300",
                    isCurrent && "text-primary2",
                    isCompleted && "text-white",
                    isUpcoming && "text-zinc-500"
                  )}>
                    {step.label}
                  </div>
                  <div className={cn(
                    "text-xs mt-1 transition-colors duration-300",
                    isCurrent && "text-primary2/70",
                    isCompleted && "text-zinc-400",
                    isUpcoming && "text-zinc-600"
                  )}>
                    Step {index + 1}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-white">
            Step {currentStep + 1} of {steps.length}
          </div>
          <div className="text-sm text-zinc-400">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </div>
        </div>
        
        <div className="relative">
          <div className="w-full h-2 bg-zinc-800/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary2 to-darkPrimary"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center border-2",
            "bg-gradient-to-br from-primary2/20 to-darkPrimary/20 border-primary2"
          )}>
            {React.createElement(steps[currentStep].icon, {
              className: "w-5 h-5 text-primary2"
            })}
          </div>
          <div>
            <div className="text-sm font-medium text-white">
              {steps[currentStep].label}
            </div>
            <div className="text-xs text-zinc-400">
              Current Step
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 