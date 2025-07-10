import { Card, CardContent } from "@/components/ui/card";
import { ProjectProgress } from "@/components/ui/progress";
import { Project, Issue, Media } from "@/types/dashboard";
import { calculateDetailedProgress } from "@/lib/utils";
import Image from "next/image";
import ProjectIcon from "@/public/icons/project";

interface RecentProjectCardProps {
  project: Project;
  compact?: boolean;
}

export const RecentProjectCard = ({ project }: RecentProjectCardProps) => {
  const progressData = calculateDetailedProgress(project.issues as Issue[]);

  return (
    <Card className="bg-darkGray border-none rounded-lg hover:bg-darkGray/80 transition-colors">
      <CardContent className="p-4 space-y-3">
        {/* Project Header */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-800 p-1.5 flex items-center justify-center flex-shrink-0">
            {typeof (project.logo as Media)?.url === "string" &&
            (project.logo as Media).url ? (
              <Image
                src={(project.logo as Media).url as string}
                alt={project.title}
                width={20}
                height={20}
                className="rounded"
              />
            ) : (
              <ProjectIcon />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white text-sm truncate">
              {project.title}
            </h3>
            <p className="text-xs text-white/60 truncate">
              {project.description || "No description"}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-white">
              {progressData.overallPercentage}%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <ProjectProgress
            donePercentage={progressData.donePercentage}
            inProgressPercentage={progressData.inProgressPercentage}
            className="h-2"
          />

          {/* Progress Labels */}
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-4">
              {progressData.done > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#D4B0FF] to-[#3D70F1]"></div>
                  <span className="text-white font-medium">
                    {progressData.done}
                  </span>
                  <span className="text-gray-400">Done</span>
                </div>
              )}

              {progressData.inProgress > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#F2AF8E] to-[#EFE7A8]"></div>
                  <span className="text-white font-medium">
                    {progressData.inProgress}
                  </span>
                  <span className="text-gray-400">In progress</span>
                </div>
              )}

              {progressData.remaining > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-gray-700 to-gray-600"></div>
                  <span className="text-white font-medium">
                    {progressData.remaining}
                  </span>
                  <span className="text-gray-400">Remaining</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
