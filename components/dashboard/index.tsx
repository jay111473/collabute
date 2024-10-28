"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CircleUser,
  GitPullRequest,
  DollarSign,
  Clock9,
  AlarmClock,
  SortDesc,
} from "lucide-react";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchFilterBar from "@/components/dashboard/project/search-filter-bar";
import { calculateProgressPercentage } from "@/lib/utils";
import { Project } from "@/types/dashboard";
import IssueCard from "./project/issue-card";

const ProjectPageComponent = ({ project }: { project: Project }) => {
  const progressPercentage = calculateProgressPercentage(project.issues);

  return (
    <div className="flex flex-col">
      <header className="flex h-14 justify-between items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <h3 className="text-lg dark:text-white">Explore Projects</h3>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-opacity-50"
        >
          <CircleUser className="h-5 w-5" />
        </Button>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <Card className="flex flex-col gap-2 py-4">
          <div className="flex items-center justify-start gap-4 px-4">
            <h3 className="font-medium text-black">{project?.title}</h3>
            <Badge
              className="font-medium !text-xs"
              icon={<GitPullRequest className="h-4 w-4 text-primary2" />}
              variant="outline"
            >
              {project.issues.length} issues
            </Badge>
            <Badge
              className="font-medium !text-xs"
              icon={<DollarSign className="h-4 w-4 text-primary2" />}
              variant="outline"
            >
              budget
              <span className="text-xs">${project.budget}</span>
            </Badge>
            <Badge
              className="font-medium !text-xs"
              icon={<Clock9 className="h-4 w-4 text-primary2" />}
              variant="outline"
            >
              timeline
              <Progress className="w-20 ml-2" value={progressPercentage} />
              <span className="text-xs">{progressPercentage}%</span>
            </Badge>
          </div>
          <p className="text-gray-600 font-medium text-xs px-4 py-2">
            {project.description}
          </p>
          <span className="w-full h-px bg-gray-200"></span>
          <Tabs defaultValue="issues">
            <TabsList className="p-4">
              <TabsTrigger value="issues">
                Issues ({project.issues.length})
              </TabsTrigger>
              <TabsTrigger value="collabuters">Collabuters</TabsTrigger>
              <TabsTrigger value="latest-activity">Latest Activity</TabsTrigger>
            </TabsList>
            <TabsContent className="p-4 flex flex-col gap-y-4" value="issues">
              <SearchFilterBar
                placeholder="Search Issues"
                filters={[
                  {
                    label: "Urgent",
                    value: "urgent",
                    icon: <AlarmClock size={16} />,
                  },
                  {
                    label: "Sort: Newest",
                    value: "newest",
                    icon: <SortDesc size={16} />,
                  },
                ]}
                onChange={(value) => {
                  console.log(value);
                }}
              />
              <div className="flex flex-col gap-4">
                {project.issues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
};

export default ProjectPageComponent;
