import { Project } from "@/types/convex";

// Milestone status type
export type MilestoneStatus = "not-started" | "in-progress" | "completed";

// Milestone phase information interface
export interface MilestonePhase {
  phase: string;
  color: string;
  icon: string;
  status: "active" | "completed" | "not-started";
}

// Milestone configuration with colors and metadata
export const MILESTONE_CONFIG = {
  ideaRefinement: {
    name: "Idea Refinement",
    icon: "💡",
    shadowColor: "rgba(251,113,133,0.3)",
    borderColor: "border-rose-400/25",
    badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    completedBadgeColor: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    order: 1,
  },
  documentation: {
    name: "Documentation",
    icon: "📝",
    shadowColor: "rgba(251,191,36,0.3)",
    borderColor: "border-amber-400/25",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    completedBadgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    order: 2,
  },
  design: {
    name: "Design",
    icon: "🎨",
    shadowColor: "rgba(34,211,238,0.3)",
    borderColor: "border-cyan-400/25",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    completedBadgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    order: 3,
  },
  development: {
    name: "Development",
    icon: "⚡",
    shadowColor: "rgba(129,140,248,0.3)",
    borderColor: "border-indigo-400/25",
    badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    completedBadgeColor:
      "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    order: 4,
  },
  testing: {
    name: "Testing",
    icon: "🔍",
    shadowColor: "rgba(167,139,250,0.3)",
    borderColor: "border-purple-400/25",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    completedBadgeColor:
      "bg-purple-500/10 text-purple-300 border-purple-500/20",
    order: 5,
  },
  launch: {
    name: "Launch",
    icon: "🎯",
    shadowColor: "rgba(96,165,250,0.3)",
    borderColor: "border-blue-400/25",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    completedBadgeColor: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    order: 6,
  },
  maintenance: {
    name: "Maintenance",
    icon: "🔧",
    shadowColor: "rgba(45,212,191,0.3)",
    borderColor: "border-teal-400/25",
    badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    completedBadgeColor: "bg-teal-500/10 text-teal-300 border-teal-500/20",
    order: 7,
  },
  scaling: {
    name: "Scaling",
    icon: "🚀",
    shadowColor: "rgba(52,211,153,0.3)",
    borderColor: "border-emerald-400/25",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    completedBadgeColor:
      "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    order: 8,
  },
} as const;

// Default fallback configuration
const DEFAULT_CONFIG = {
  shadowColor: "rgba(100,116,139,0.25)",
  borderColor: "border-slate-500/20",
  badgeColor: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

/**
 * Get the currently active milestone from project milestones
 */
export function getActiveMilestone(
  milestones?: Project["milestones"]
): keyof typeof MILESTONE_CONFIG | null {
  if (!milestones) return null;

  // Find the milestone that is currently in progress
  for (const [key, status] of Object.entries(milestones)) {
    if (status === "in-progress") {
      return key as keyof typeof MILESTONE_CONFIG;
    }
  }

  return null;
}

/**
 * Get the most recently completed milestone from project milestones
 */
export function getLastCompletedMilestone(
  milestones?: Project["milestones"]
): keyof typeof MILESTONE_CONFIG | null {
  if (!milestones) return null;

  // Get milestones in reverse order (latest first) and find the first completed one
  const orderedMilestones = Object.entries(MILESTONE_CONFIG)
    .sort((a, b) => b[1].order - a[1].order)
    .map(([key]) => key as keyof typeof MILESTONE_CONFIG);

  for (const milestone of orderedMilestones) {
    if (milestones[milestone] === "completed") {
      return milestone;
    }
  }

  return null;
}

/**
 * Get milestone-based shadow styling for components
 */
export function getMilestoneShadow(milestones?: Project["milestones"]): string {
  // Check for active milestone first
  const activeMilestone = getActiveMilestone(milestones);
  if (activeMilestone) {
    const config = MILESTONE_CONFIG[activeMilestone];
    return `shadow-[inset_0_2px_25px_${config.shadowColor}] border-t-2 ${config.borderColor}`;
  }

  // Check for last completed milestone with muted styling
  const lastCompleted = getLastCompletedMilestone(milestones);
  if (lastCompleted) {
    const config = MILESTONE_CONFIG[lastCompleted];
    const mutedShadowColor = config.shadowColor.replace("0.3", "0.15");
    const mutedBorderColor = config.borderColor.replace("/25", "/15");
    return `shadow-[inset_0_2px_15px_${mutedShadowColor}] border-t ${mutedBorderColor}`;
  }

  // Default styling for projects with no milestones or no progress
  if (!milestones) {
    return `shadow-[inset_0_2px_20px_${DEFAULT_CONFIG.shadowColor}] border-t-2 ${DEFAULT_CONFIG.borderColor}`;
  }

  return `shadow-[inset_0_2px_15px_rgba(100,116,139,0.2)] border-t border-slate-400/20`;
}

/**
 * Get current milestone phase information for display
 */
export function getCurrentMilestonePhase(
  milestones?: Project["milestones"]
): MilestonePhase {
  // Check for active milestone first
  const activeMilestone = getActiveMilestone(milestones);
  if (activeMilestone) {
    const config = MILESTONE_CONFIG[activeMilestone];
    return {
      phase: config.name,
      color: config.badgeColor,
      icon: config.icon,
      status: "active",
    };
  }

  // Check for last completed milestone
  const lastCompleted = getLastCompletedMilestone(milestones);
  if (lastCompleted) {
    const config = MILESTONE_CONFIG[lastCompleted];
    return {
      phase: `${config.name} Complete`,
      color: config.completedBadgeColor,
      icon: "✅",
      status: "completed",
    };
  }

  // Default state
  return {
    phase: milestones ? "Not Started" : "Planning",
    color: DEFAULT_CONFIG.badgeColor,
    icon: "📋",
    status: "not-started",
  };
}

/**
 * Get milestone completion statistics
 */
export function getMilestoneStats(milestones?: Project["milestones"]) {
  if (!milestones) {
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      completionPercentage: 0,
    };
  }

  const total = Object.keys(milestones).length;
  const completed = Object.values(milestones).filter(
    (status) => status === "completed"
  ).length;
  const inProgress = Object.values(milestones).filter(
    (status) => status === "in-progress"
  ).length;
  const notStarted = total - completed - inProgress;
  const completionPercentage =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    inProgress,
    notStarted,
    completionPercentage,
  };
}

/**
 * Get all milestones with their status and configuration
 */
export function getAllMilestonesWithStatus(milestones?: Project["milestones"]) {
  return Object.entries(MILESTONE_CONFIG).map(([key, config]) => ({
    key: key as keyof typeof MILESTONE_CONFIG,
    name: config.name,
    icon: config.icon,
    order: config.order,
    status: milestones?.[key as keyof typeof MILESTONE_CONFIG] || "not-started",
    config,
  }));
}

/**
 * Check if a milestone is active (in-progress)
 */
export function isMilestoneActive(
  milestone: keyof typeof MILESTONE_CONFIG,
  milestones?: Project["milestones"]
): boolean {
  return milestones?.[milestone] === "in-progress";
}

/**
 * Check if a milestone is completed
 */
export function isMilestoneCompleted(
  milestone: keyof typeof MILESTONE_CONFIG,
  milestones?: Project["milestones"]
): boolean {
  return milestones?.[milestone] === "completed";
}

/**
 * Get the next milestone in the sequence
 */
export function getNextMilestone(
  milestones?: Project["milestones"]
): keyof typeof MILESTONE_CONFIG | null {
  if (!milestones) return "ideaRefinement";

  const orderedMilestones = Object.entries(MILESTONE_CONFIG)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([key]) => key as keyof typeof MILESTONE_CONFIG);

  for (const milestone of orderedMilestones) {
    if (milestones[milestone] === "not-started") {
      return milestone;
    }
  }

  return null; // All milestones are completed or in progress
}
