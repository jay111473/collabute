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
        <div className="flex items-start justify-between relative px-4">
          {/* Progress Line */}
          <div className="absolute top-8 left-8 right-8 h-px bg-gray-800/60 z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 shadow-sm"
              initial={{ width: "0%" }}
              animate={{ 
                width: currentStep === 0 ? "0%" : `${(currentStep / (steps.length - 1)) * 100}%` 
              }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;

            return (
              <div key={index} className="flex flex-col items-center relative z-10 max-w-[120px]">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 relative overflow-hidden",
                    isCompleted && "bg-gradient-to-br from-purple-500 to-blue-600 border-purple-400/50 shadow-lg shadow-purple-500/25",
                    isCurrent && "bg-gradient-to-br from-purple-500/10 to-blue-600/10 border-purple-400 shadow-lg shadow-purple-500/20 ring-2 ring-purple-500/30",
                    isUpcoming && "bg-darkGray border-gray-700/50 hover:border-gray-600/50 transition-colors"
                  )}
                >
                  {/* Background glow effect for current step */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-2xl"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  
                  {isCompleted ? (
                    <Check className="w-7 h-7 text-white relative z-10" />
                  ) : (
                    <Icon className={cn(
                      "w-7 h-7 relative z-10 transition-colors duration-300",
                      isCurrent && "text-purple-400",
                      isUpcoming && "text-gray-500"
                    )} />
                  )}
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  className="mt-4 text-center"
                >
                  <div className={cn(
                    "text-sm font-semibold transition-colors duration-300 leading-tight",
                    isCurrent && "text-purple-400",
                    isCompleted && "text-white",
                    isUpcoming && "text-gray-500"
                  )}>
                    {step.label}
                  </div>
                  <div className={cn(
                    "text-xs mt-1.5 font-medium transition-colors duration-300",
                    isCurrent && "text-purple-400/70",
                    isCompleted && "text-gray-300",
                    isUpcoming && "text-gray-600"
                  )}>
                    Step {index + 1}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tablet Progress Bar */}
      <div className="hidden md:block lg:hidden">
        <div className="flex items-start justify-between relative px-2">
          {/* Progress Line */}
          <div className="absolute top-6 left-6 right-6 h-px bg-gray-800/60 z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-600"
              initial={{ width: "0%" }}
              animate={{ 
                width: currentStep === 0 ? "0%" : `${(currentStep / (steps.length - 1)) * 100}%` 
              }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;

            return (
              <div key={index} className="flex flex-col items-center relative z-10 max-w-[80px]">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500",
                    isCompleted && "bg-gradient-to-br from-purple-500 to-blue-600 border-purple-400/50 shadow-lg shadow-purple-500/25",
                    isCurrent && "bg-gradient-to-br from-purple-500/10 to-blue-600/10 border-purple-400 shadow-lg shadow-purple-500/20",
                    isUpcoming && "bg-darkGray border-gray-700/50"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className={cn(
                      "w-5 h-5 transition-colors duration-300",
                      isCurrent && "text-purple-400",
                      isUpcoming && "text-gray-500"
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
                    "text-xs font-semibold transition-colors duration-300",
                    isCurrent && "text-purple-400",
                    isCompleted && "text-white",
                    isUpcoming && "text-gray-500"
                  )}>
                    {step.shortLabel}
                  </div>
                  <div className={cn(
                    "text-xs mt-1 font-medium transition-colors duration-300",
                    isCurrent && "text-purple-400/70",
                    isCompleted && "text-gray-300",
                    isUpcoming && "text-gray-600"
                  )}>
                    {index + 1}
                  </div>
                </motion.div>
              </div>
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
                className="h-full bg-gradient-to-r from-purple-500 to-blue-600 shadow-sm"
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
              "bg-gradient-to-br from-purple-500/10 to-blue-600/10 border-purple-400"
            )}>
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-xl"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              {React.createElement(steps[currentStep].icon, {
                className: "w-6 h-6 text-purple-400 relative z-10"
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