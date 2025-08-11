"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProjectProgress } from "@/components/ui/progress";
import { DollarSign, Clock9, Users } from "lucide-react";
import { Suspense } from "react";
import { calculateDetailedProgress, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectIcon from "@/public/icons/project";
import Image from "next/image";
import Link from "next/link";
import { Media, EnhancedProject, ProjectStatus } from "@/types/convex";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

interface ProjectStatusBadgeProps {
  status?: ProjectStatus;
}

function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  // Map ProjectStatus enum to visual status badges
  const getStatusInfo = () => {
    switch (status) {
      case "COMPLETED":
        return { text: "Completed", variant: "success" };
      case "ON_HOLD":
        return { text: "On Hold", variant: "warning" };
      case "IN_PROGRESS":
        return { text: "Active", variant: "active" };
      case "PLANNED":
        return { text: "Planned", variant: "planned" };
      default:
        return { text: "Unknown", variant: "default" };
    }
  };

  const statusInfo = getStatusInfo();

  const getStatusClasses = (variant: string) => {
    switch (variant) {
      case "active":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20 backdrop-blur-sm";
      case "warning":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 backdrop-blur-sm";
      case "success":
        return "bg-green-500/10 text-green-400 border-green-500/20 backdrop-blur-sm";
      case "planned":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20 backdrop-blur-sm";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20 backdrop-blur-sm";
    }
  };

  return (
    <Badge
      variant="outline"
      className={`font-medium text-xs px-3 py-1.5 rounded-full border ${getStatusClasses(statusInfo.variant)}`}
    >
      {statusInfo.text}
    </Badge>
  );
}

function ProjectHeader({
  project,
  progressData,
}: {
  project: EnhancedProject;
  progressData: {
    total: number;
    done: number;
    inProgress: number;
    remaining: number;
    donePercentage: number;
    inProgressPercentage: number;
    overallPercentage: number;
  };
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-4 gap-y-4">
        <div className="flex items-center gap-2">
          <ProjectIcon />
          <h3 className="font-medium text-white text-lg">{project?.title}</h3>
          {project.state === "under-review" && (
            <Badge
              variant="outline"
              className="ml-2 bg-gray-900 text-gray-300 border-gray-500"
            >
              Under Review
            </Badge>
          )}
          <Badge
            className="font-medium !text-xs"
            icon={<Users className="h-4 w-4 text-darkPrimary" />}
            variant="outline"
          >
            Collaborators {project.collaboratorCount || 0}
          </Badge>
          <Badge
            className="font-medium !text-xs"
            icon={<DollarSign className="h-4 w-4 text-darkPrimary" />}
            variant="outline"
          >
            Budget $
            {project.budget
              ? project.budget >= 1000
                ? `${Math.round(project.budget / 1000)}k`
                : project.budget
              : "0"}
          </Badge>
          <Badge
            className="font-medium !text-xs"
            icon={<Clock9 className="h-4 w-4 text-darkPrimary" />}
            variant="outline"
          >
            Deliver date Apr 20, 2024
          </Badge>
        </div>
        <div className="text-right">
          <ProjectStatusBadge status={project.status} />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <ProjectProgress
          donePercentage={progressData.donePercentage}
          inProgressPercentage={progressData.inProgressPercentage}
          className="h-3 mb-3"
        />
        <div className="relative text-sm">
          {/* Done label positioned under blue segment */}
          {progressData.donePercentage > 0 && (
            <div
              className="absolute font-medium"
              style={{
                left: `${progressData.donePercentage / 2}%`,
                transform: "translateX(-50%)",
              }}
            >
              <span className="bg-gradient-to-r from-[#D4B0FF] to-[#3D70F1] bg-clip-text text-transparent">
                {progressData.done}
              </span>
              <span className="text-gray-400 ml-1">Done</span>
            </div>
          )}

          {/* In Progress label positioned under yellow segment */}
          {progressData.inProgressPercentage > 0 && (
            <div
              className="absolute font-medium"
              style={{
                left: `${
                  progressData.donePercentage +
                  progressData.inProgressPercentage / 2
                }%`,
                transform: "translateX(-50%)",
              }}
            >
              <span className="bg-gradient-to-r from-[#F2AF8E] to-[#EFE7A8] bg-clip-text text-transparent">
                {progressData.inProgress}
              </span>
              <span className="text-gray-400 ml-1">In progress</span>
            </div>
          )}

          {/* Remaining label positioned under gray segment */}
          {progressData.remaining > 0 && (
            <div
              className="absolute font-medium"
              style={{
                left: `${
                  progressData.donePercentage +
                  progressData.inProgressPercentage +
                  (100 -
                    progressData.donePercentage -
                    progressData.inProgressPercentage) /
                    2
                }%`,
                transform: "translateX(-50%)",
              }}
            >
              <span className="bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent">
                {progressData.remaining}
              </span>
              <span className="text-gray-400 ml-1">Remaining</span>
            </div>
          )}
        </div>
      </div>
      {/* Project Lead Section */}
      <div className="flex items-center gap-2 px-4 py-2">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
          {project.teamLead && typeof project.teamLead === "object" ? (
            project.teamLead.profilePicture &&
            typeof project.teamLead.profilePicture === "object" ? (
              <Image
                src={
                  (project.teamLead.profilePicture as Media).url ||
                  "/placeholder-avatar.png"
                }
                alt={project.teamLead.name || "Team Lead"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {project.teamLead.name?.charAt(0).toUpperCase()}
              </div>
            )
          ) : (
            <div className="w-full h-full bg-gray-600 flex items-center justify-center text-gray-400 text-xs">
              ?
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-white font-medium">
            {project.teamLead && typeof project.teamLead === "object"
              ? project.teamLead.name
              : "No Lead"}
          </span>
          <span className="text-gray-400">Project lead</span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-400 text-sm">
            Last updated{" "}
            <span className="text-white">
              {formatDate(
                new Date(
                  project.updatedAt || project._creationTime
                ).toISOString()
              )}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

const MyProjectCard = ({ project }: { project: EnhancedProject }) => {
  const issues = useQuery(api.issues.getIssuesByProject, {
    projectId: project._id,
  });
  const progressData = calculateDetailedProgress(issues || []);

  return (
    <Link
      href={`/dashboard/projects/${project.slug}`}
      className="flex flex-col w-full"
    >
      <main className="flex flex-1 flex-col gap-4 lg:gap-6 w-full">
        <Card
          className={`flex flex-col gap-2 py-5 px-2 bg-darkGray text-white w-full ${project.state === "under-review" ? "border-2 border-gray-500" : "border-none"}`}
        >
          <Suspense fallback={<Skeleton className="h-20 w-full" />}>
            <ProjectHeader project={project} progressData={progressData} />
          </Suspense>
        </Card>
      </main>
    </Link>
  );
};

export default MyProjectCard;
