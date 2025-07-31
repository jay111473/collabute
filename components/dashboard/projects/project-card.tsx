import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Divider } from "@/components/uikit/divider";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types/convex";
import { truncateText } from "@/lib/utils";
import { GitPullRequest } from "lucide-react";
import Link from "next/link";
import {
  getCurrentMilestonePhase,
  getMilestoneShadow,
  getMilestoneStats,
} from "@/lib/utils/milestone-utils";
import { getIssuesByProject } from "@/convex/issues";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const milestonePhase = getCurrentMilestonePhase(project.milestones);
  const milestoneShadow = getMilestoneShadow(project.milestones);
  const milestoneStats = getMilestoneStats(project.milestones);
  const issues = useQuery(api.issues.getIssuesByProject, {
    projectId: project._id,
  });
  return (
    <Link href={`/dashboard/explore/${project.slug}`}>
      <div className="relative mt-3">
        {/* Milestone Phase Badge - Folder tab style */}
        <div className="absolute -top-4 left-4 z-0">
          <div
            className={`text-xs rounded-t-md rounded-b-none px-3 py-1.5 bg-darkGray shadow-lg ${milestonePhase.color}`}
          >
            <span className="mr-1">{milestonePhase.icon}</span>
            {milestonePhase.phase}
            {milestonePhase.status === "active" && (
              <span className="ml-1 inline-flex h-1.5 w-1.5 rounded-full bg-current animate-pulse"></span>
            )}
          </div>
        </div>

        <Card
          className={`text-white rounded-lg border-none hover:shadow-primary2 duration-300 bg-darkGray ${milestoneShadow} z-10`}
        >
          <CardContent className="flex flex-col p-0 py-4 space-y-4">
            <div className="flex justify-between px-4">
              <div className="flex flex-col justify-start items-start gap-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-medium text-white">
                    {project.title}
                  </h3>
                  <Badge
                    className="font-medium !text-xs border-grayBorders text-white"
                    icon={
                      <GitPullRequest className="h-4 w-4 text-darkPrimary" />
                    }
                    variant="outline"
                  >
                    {issues?.length} issues
                  </Badge>
                </div>
                <p className="text-white/60 truncate">
                  {truncateText(project.description)}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-darkPrimary font-bold text-xl">
                  ${project.budget}
                </div>
                <p className="text-white/60 text-xs">Budget</p>
              </div>
            </div>
            <Divider />
            <div className="flex px-6 items-center justify-between">
              <p className="text-sm  py-0">Skills</p>
              {/* <p className="text-xs py-0">
                {project?.stacks?.map((stack: Stack) => stack?.name)}
              </p> */}
            </div>
            <Divider />
            <div className="flex px-6 items-center gap-2 justify-between">
              <p className="text-sm">Milestone Progress</p>
              <div className="flex items-center gap-2">
                <Progress
                  className="w-20 ml-2 bg-gray-300"
                  value={milestoneStats.completionPercentage}
                />
                <p className="text-xs">
                  {milestoneStats.completionPercentage}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Link>
  );
};
