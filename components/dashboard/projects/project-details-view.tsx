"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProjectProgress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DollarSign,
  Clock,
  Users,
  Calendar,
  CheckCircle2,
  Circle,
  Play,
  Rocket,
} from "lucide-react";
import { calculateDetailedProgress, formatDate } from "@/lib/utils";
import { Issue, Project } from "@/types/dashboard";
import ProjectIcon from "@/public/icons/project";
import Link from "next/link";
import {
  getMilestoneShadow,
  getCurrentMilestonePhase,
} from "@/lib/utils/milestone-utils";

interface ProjectDetailsViewProps {
  project: Project;
}

interface MilestoneItem {
  id: string;
  title: string;
  milestone: string;
  status: "completed" | "in-progress" | "not-started";
  timeAgo?: string;
  dueDate?: string;
  icon: React.ReactNode;
}

const ProjectDetailsView = ({ project }: ProjectDetailsViewProps) => {
  const progressData = calculateDetailedProgress(project.issues as Issue[]);

  // Get milestone information using utility functions
  const milestonePhase = getCurrentMilestonePhase(project.milestones);
  const milestoneShadow = getMilestoneShadow(project.milestones);
  // Helper function to calculate timeline
  const getTimeline = (): string => {
    if (!project.startDate) return "Not specified";
    const start = new Date(project.startDate);
    const end = project.endDate ? new Date(project.endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.ceil(diffDays / 30);
    return diffMonths > 1 ? `${diffMonths} months` : `${diffDays} days`;
  };

  // Helper function to get collaborators count
  const getCollaboratorsCount = (): number => {
    return project.collabuters?.length || 0;
  };

  // Helper function to format budget
  const formatBudget = (budget?: number | null): string => {
    if (!budget) return "Not specified";
    return budget >= 1000 ? `${Math.round(budget / 1000)}k` : budget.toString();
  };

  // Mock milestone data - in real implementation, this would come from the API
  const milestones: MilestoneItem[] = [
    {
      id: "1",
      title: "Project Kickoff",
      milestone: "Milestone 1",
      status: "completed",
      timeAgo: "20 days ago",
      dueDate: project.startDate ? formatDate(project.startDate) : undefined,
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    },
    {
      id: "2",
      title: "Development Phase",
      milestone: "Milestone 2",
      status: project.status === "in-progress" ? "in-progress" : "completed",
      timeAgo: project.status === "completed" ? "3 days ago" : undefined,
      dueDate: project.endDate ? formatDate(project.endDate) : undefined,
      icon:
        project.status === "in-progress" ? (
          <Play className="h-4 w-4 text-yellow-500" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ),
    },
    {
      id: "3",
      title: "Testing & QA",
      milestone: "Milestone 3",
      status: project.status === "completed" ? "completed" : "not-started",
      dueDate: project.endDate ? formatDate(project.endDate) : undefined,
      icon:
        project.status === "completed" ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <Circle className="h-4 w-4 text-gray-400" />
        ),
    },
    {
      id: "4",
      title: "Project Delivery",
      milestone: "Milestone 4",
      status: project.status === "completed" ? "completed" : "not-started",
      dueDate: project.endDate ? formatDate(project.endDate) : undefined,
      icon:
        project.status === "completed" ? (
          <Rocket className="h-4 w-4 text-green-500" />
        ) : (
          <Rocket className="h-4 w-4 text-gray-400" />
        ),
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
            Completed
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
            In-progress
          </Badge>
        );
      case "not-started":
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
            Not started
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTimeDisplay = (milestone: MilestoneItem) => {
    if (milestone.status === "completed" && milestone.timeAgo) {
      return <span className="text-gray-400 text-xs">{milestone.timeAgo}</span>;
    }
    if (milestone.status === "in-progress") {
      return <span className="text-yellow-400 text-xs">In progress</span>;
    }
    if (milestone.status === "not-started") {
      return <span className="text-gray-400 text-xs">Pending</span>;
    }
    return milestone.dueDate ? (
      <span className="text-gray-400 text-xs">({milestone.dueDate})</span>
    ) : null;
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header Section - Black Background */}
      <div className={`bg-black p-6 space-y-6 ${milestoneShadow}`}>
        {/* Milestone Phase Identifier - Top of Card */}
        <div className="flex items-center justify-between">
          <Badge
            className={`font-semibold text-sm border px-4 py-2 ${milestonePhase.color}`}
          >
            <span className="mr-2 text-base">{milestonePhase.icon}</span>
            {milestonePhase.phase}
            {milestonePhase.status === "active" && (
              <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-current animate-pulse"></span>
            )}
          </Badge>
          {milestonePhase.status === "active" && (
            <div className="text-xs text-gray-400 font-medium">
              Active Phase
            </div>
          )}
        </div>

        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList className="text-xs text-gray-400">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/dashboard/projects"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  All Projects
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-500" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white font-medium">
                {project.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Project Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 ">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <ProjectIcon />
              <h1 className="text-xl font-semibold text-white">
                {project.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className="font-medium !text-xs"
                icon={<Users className="h-3 w-3 text-darkPrimary" />}
                variant="outline"
              >
                Issues {project.issues?.length || 0}
              </Badge>
              <Badge
                className="font-medium !text-xs"
                icon={<Clock className="h-3 w-3 text-darkPrimary" />}
                variant="outline"
              >
                Timeline {getTimeline()}
              </Badge>
              <Badge
                className="font-medium !text-xs"
                icon={<Users className="h-3 w-3 text-darkPrimary" />}
                variant="outline"
              >
                Collaborators {getCollaboratorsCount()}
              </Badge>
              <Badge
                className="font-medium !text-xs"
                icon={<DollarSign className="h-3 w-3 text-darkPrimary" />}
                variant="outline"
              >
                Budget ${formatBudget(project.budget)}
              </Badge>
              <Badge
                className="font-medium !text-xs"
                icon={<Calendar className="h-3 w-3 text-darkPrimary" />}
                variant="outline"
              >
                Due {project.endDate ? formatDate(project.endDate) : "Not set"}
              </Badge>
            </div>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white w-fit text-sm">
            Manage funds
          </Button>
        </div>

        {/* Project Description */}
        <p className="text-gray-300 max-w-4xl leading-relaxed text-sm">
          {project.description || "No description provided for this project."}
        </p>

        {/* Project Tech Stack */}
        {project.stacks && project.stacks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-400 text-xs">Tech Stack:</span>
            {project.stacks.map((stack, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {typeof stack === "object" ? stack.name : "Unknown"}
              </Badge>
            ))}
          </div>
        )}

        {/* Tabs Navigation - Stays in Black Header */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-transparent border-b border-gray-700 rounded-none h-auto p-0">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-transparent text-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="data-[state=active]:bg-transparent text-sm"
            >
              Tasks ({project.issues?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="data-[state=active]:bg-transparent text-sm"
            >
              Files
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-transparent text-sm"
            >
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="data-[state=active]:bg-transparent text-sm"
            >
              Payments
            </TabsTrigger>
          </TabsList>

          {/* Tab Content Section - Dark Gray Background */}
          <div className="bg-darkGray mt-4 rounded-lg">
            <TabsContent value="overview" className="mt-0 p-6">
              <div className="space-y-8">
                {/* Project Progress Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">
                      Project progress
                    </h2>
                    <div className="text-right">
                      <div className="text-white">
                        <span className="text-gray-300 text-sm">
                          Overall completion
                        </span>{" "}
                        <span className="text-xl font-bold text-white ml-4">
                          {progressData.overallPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar - Exact same implementation as index.tsx */}
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
                          <span className="text-gray-400 ml-1">
                            In progress
                          </span>
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
                </div>
                {/* Milestone Timeline */}
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-white">
                    Project Timeline
                  </h2>
                  <div className="space-y-0 relative">
                    {milestones.map((milestone, index) => (
                      <div
                        key={milestone.id}
                        className="relative flex items-center gap-4 py-3"
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0 z-10 bg-darkGray">
                          {milestone.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-white font-medium text-sm">
                              {milestone.title}
                            </h3>
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                              {milestone.milestone}
                            </Badge>
                            {getStatusBadge(milestone.status)}
                          </div>
                          <div className="flex items-center gap-4">
                            {getTimeDisplay(milestone)}
                          </div>
                        </div>

                        {/* Connector line */}
                        {index < milestones.length - 1 && (
                          <div className="absolute left-[8px] top-[24px] w-px h-6 bg-gray-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-0 p-6">
              <Card className="bg-darkGray border-gray-700 p-6">
                <div className="text-center py-12">
                  <h3 className="text-base font-medium text-white mb-2">
                    Tasks Coming Soon
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Task management features will be available soon.
                  </p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="mt-0 p-6">
              <Card className="bg-darkGray border-gray-700 p-6">
                <div className="text-center py-12">
                  <h3 className="text-base font-medium text-white mb-2">
                    Files Coming Soon
                  </h3>
                  <p className="text-gray-400 text-sm">
                    File management features will be available soon.
                  </p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-0 p-6">
              <Card className="bg-darkGray border-gray-700 p-6">
                <div className="text-center py-12">
                  <h3 className="text-base font-medium text-white mb-2">
                    Activity Coming Soon
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Activity feed will be available soon.
                  </p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="mt-0 p-6">
              <Card className="bg-darkGray border-gray-700 p-6">
                <div className="text-center py-12">
                  <h3 className="text-base font-medium text-white mb-2">
                    Payments Coming Soon
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Payment management features will be available soon.
                  </p>
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetailsView;
