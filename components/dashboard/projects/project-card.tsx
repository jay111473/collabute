import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Divider } from "@/components/uikit/divider";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types/dashboard";
import { truncateText } from "@/lib/utils";
import { GitPullRequest } from "lucide-react";
import Link from "next/link";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Link href={`/dashboard/explore/${project.slug}`}>
      <Card className="text-black rounded-lg hover:shadow-primary2 duration-300">
        <CardContent className="flex flex-col p-0 py-4 space-y-4">
          <div className="flex justify-between px-4">
            <div className="flex flex-col justify-start items-start gap-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-medium">{project.title}</h3>
                <Badge
                  className="font-medium !text-xs"
                  icon={<GitPullRequest className="h-4 w-4 text-primary2" />}
                  variant="outline"
                >
                  {project.issues.length} issues
                </Badge>
              </div>
              <p className="text-gray-500 truncate">
                {truncateText(project.description)}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-primary-light font-bold text-xl">
                ${project.budget}
              </div>
              <p className="text-gray-500 text-xs">Budget</p>
            </div>
          </div>
          <Divider />
          <div className="flex px-6 items-center justify-between">
            <p className="text-sm  py-0">Skills</p>
            <p className="text-xs py-0">
              {project?.stacks?.map((stack) => stack.name)}
            </p>
          </div>
          <Divider />
          <div className="flex px-6 items-center gap-2 justify-between">
            <p className="text-sm ">Progress</p>
            <div className="flex items-center gap-2">
              <Progress className="w-20 ml-2 bg-gray-300" value={30} />
              <p className="text-xs">Two weeks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
