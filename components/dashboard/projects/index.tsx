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
import { Project, Media, User, Issue } from "@/types/convex";

// Extended Project type with populated relations
type ProjectWithData = Project & {
  teamLead?: User;
  owner?: User;
  issues?: any[];
  collaborators?: any[];
  collabuters?: any[];
  projectState?: string;
  updatedAt?: number;
};

function ProjectHeader({
  project,
  progressData,
}: {
  project: ProjectWithData;
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
            Collaboraters {project.collabuters?.length || 0}
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
          <div className="text-white">
            <span className="text-gray-300">Project Progress:</span>{" "}
            <span className="text-darkPrimary font-medium">
              {progressData.overallPercentage}%
            </span>
          </div>
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
            {formatDate(
              new Date(project.updatedAt || project._creationTime).toISOString()
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

const MyProjectCard = ({ project }: { project: ProjectWithData }) => {
  const progressData = calculateDetailedProgress(project.issues as Issue[]);

  return (
    <Link
      href={`/dashboard/projects/${project.slug}`}
      className="flex flex-col w-full"
    >
      <main className="flex flex-1 flex-col gap-4 lg:gap-6 w-full">
        <Card
          className={`flex flex-col gap-2 py-5 px-2 bg-darkGray text-white w-full ${project.projectState === "under-review" ? "border-2 border-gray-500" : "border-none"}`}
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
