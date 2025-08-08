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
  { icon: Lightbulb, label: "Project Vision", shortLabel: "Vision" },
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
      <div className="hidden lg:block">
        <div className="flex items-center gap-1 bg-darkGray2 rounded-xl p-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;

            return (
              <motion.div
                key={index}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={cn(
                  "flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-300 cursor-pointer min-w-0 flex-1",
                  isCompleted && "bg-darkPrimary/20 border border-darkPrimary/30",
                  isCurrent && "bg-darkPrimary text-white shadow-lg",
                  isUpcoming && "hover:bg-darkGray"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-6 h-6 flex items-center justify-center transition-colors duration-300",
                  isCompleted && !isCurrent && "text-darkPrimary",
                  isCurrent && "text-white",
                  isUpcoming && "text-gray-500"
                )}>
                  {isCompleted && !isCurrent ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className={cn(
                    "text-xs font-medium transition-colors duration-300 leading-3 text-center",
                    isCompleted && !isCurrent && "text-darkPrimary",
                    isCurrent && "text-white",
                    isUpcoming && "text-gray-400"
                  )}>
                    {step.label.split(' ').map((word, i) => (
                      <div key={i} className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs">{word}</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tablet Progress Bar */}
      <div className="hidden md:block lg:hidden">
        <div className="flex items-center gap-1 bg-darkGray2 rounded-xl p-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;

            return (
              <motion.div
                key={index}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer min-w-0 flex-1",
                  isCompleted && "bg-darkPrimary/20 border border-darkPrimary/30",
                  isCurrent && "bg-darkPrimary text-white shadow-lg",
                  isUpcoming && "hover:bg-darkGray"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-5 h-5 flex items-center justify-center transition-colors duration-300",
                  isCompleted && !isCurrent && "text-darkPrimary",
                  isCurrent && "text-white",
                  isUpcoming && "text-gray-500"
                )}>  
                  {isCompleted && !isCurrent ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className={cn(
                    "text-xs font-medium transition-colors duration-300 truncate",
                    isCompleted && !isCurrent && "text-darkPrimary",
                    isCurrent && "text-white",
                    isUpcoming && "text-gray-400"
                  )}>
                    {step.shortLabel}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className="md:hidden">
        <div className="space-y-4">
          {/* Progress Header */}
          <div className="flex items-center justify-between">
            <div className="text-base font-semibold text-white">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="text-sm font-medium text-purple-400">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full h-3 bg-darkGray rounded-full overflow-hidden border border-gray-800/50">
              <motion.div
                className="h-full bg-darkPrimary shadow-sm"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Current Step Info */}
          <div className="flex items-center gap-4 p-4 bg-darkGray rounded-xl border border-gray-800/50">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center border-2 relative overflow-hidden",
              "bg-darkPrimary/10 border-darkPrimary"
            )}>
              <motion.div
                className="absolute inset-0 bg-darkPrimary/20 rounded-xl"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              {React.createElement(steps[currentStep].icon, {
                className: "w-6 h-6 text-darkPrimary relative z-10"
              })}
            </div>
            <div className="flex-1">
              <div className="text-base font-semibold text-white">
                {steps[currentStep].label}
              </div>
              <div className="text-sm text-gray-400 mt-0.5">
                Current Step
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 