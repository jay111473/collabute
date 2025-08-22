"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all dark:bg-slate-50"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

interface ProjectProgressProps {
  donePercentage: number;
  inProgressPercentage: number;
  className?: string;
}

const ProjectProgress = React.forwardRef<
  HTMLDivElement,
  ProjectProgressProps
>(({ donePercentage, inProgressPercentage, className }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-2 w-full flex gap-1",
      className
    )}
  >
    {/* Done segment with custom gradient */}
    {donePercentage > 0 && (
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ 
          width: `${donePercentage}%`,
          background: 'linear-gradient(90deg, #D4B0FF 0%, #3D70F1 100%)'
        }}
      />
    )}
    {/* In Progress segment with custom gradient */}
    {inProgressPercentage > 0 && (
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ 
          width: `${inProgressPercentage}%`,
          background: 'linear-gradient(90deg, #F2AF8E 0%, #EFE7A8 100%)'
        }}
      />
    )}
    {/* Remaining segment */}
    {(100 - donePercentage - inProgressPercentage) > 0 && (
      <div
        className="h-full rounded-full bg-gradient-to-r from-gray-700 to-gray-600 transition-all duration-500 ease-out"
        style={{ 
          width: `${100 - donePercentage - inProgressPercentage}%`
        }}
      />
    )}
  </div>
));
ProjectProgress.displayName = "ProjectProgress";

export { Progress, ProjectProgress };
