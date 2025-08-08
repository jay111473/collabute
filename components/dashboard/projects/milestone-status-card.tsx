"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types/convex";
import {
  getCurrentMilestonePhase,
  getMilestoneStats,
  getAllMilestonesWithStatus,
  getNextMilestone,
  MILESTONE_CONFIG,
} from "@/lib/utils/milestone-utils";

interface MilestoneStatusCardProps {
  project: Project;
  compact?: boolean;
}

/**
 * Example component demonstrating milestone utility usage
 * Can be used in project cards, dashboards, or anywhere milestone status is needed
 */
const MilestoneStatusCard = ({ project, compact = false }: MilestoneStatusCardProps) => {
  const milestonePhase = getCurrentMilestonePhase(project.milestones);
  const milestoneStats = getMilestoneStats(project.milestones);
  const allMilestones = getAllMilestonesWithStatus(project.milestones);
  const nextMilestone = getNextMilestone(project.milestones);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <Badge className={`text-xs ${milestonePhase.color}`}>
          <span className="mr-1">{milestonePhase.icon}</span>
          {milestonePhase.phase}
        </Badge>
        <div className="text-xs text-gray-400">
          {milestoneStats.completed}/{milestoneStats.total} completed
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-darkGray border-gray-700 p-4 space-y-4">
      {/* Current Phase */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Current Phase</h3>
        <Badge className={`text-xs ${milestonePhase.color}`}>
          <span className="mr-1">{milestonePhase.icon}</span>
          {milestonePhase.phase}
          {milestonePhase.status === "active" && (
            <span className="ml-1 inline-flex h-1.5 w-1.5 rounded-full bg-current animate-pulse"></span>
          )}
        </Badge>
      </div>

      {/* Progress Overview */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Overall Progress</span>
          <span className="text-white font-medium">{milestoneStats.completionPercentage}%</span>
        </div>
        <Progress value={milestoneStats.completionPercentage} className="h-2" />
        <div className="flex justify-between text-xs text-gray-400">
          <span>{milestoneStats.completed} completed</span>
          <span>{milestoneStats.inProgress} in progress</span>
          <span>{milestoneStats.notStarted} remaining</span>
        </div>
      </div>

      {/* Next Milestone */}
      {nextMilestone && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">Next:</span>
          <span className="text-white">
            {MILESTONE_CONFIG[nextMilestone].icon} {MILESTONE_CONFIG[nextMilestone].name}
          </span>
        </div>
      )}

      {/* All Milestones Quick View */}
      <div className="flex flex-wrap gap-1">
        {allMilestones.map((milestone) => (
          <div
            key={milestone.key}
            className={`
              flex items-center gap-1 px-2 py-1 rounded text-xs
              ${
                milestone.status === "completed"
                  ? "bg-green-500/20 text-green-400"
                  : milestone.status === "in-progress"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-gray-500/20 text-gray-400"
              }
            `}
            title={`${milestone.name} - ${milestone.status}`}
          >
            <span>{milestone.icon}</span>
            <span className="hidden sm:inline">{milestone.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MilestoneStatusCard; 