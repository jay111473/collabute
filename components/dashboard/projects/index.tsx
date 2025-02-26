"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GitPullRequest, DollarSign, Clock9 } from "lucide-react";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchFilterBar from "@/components/dashboard/project/search-filter-bar";
import { calculateProgressPercentage } from "@/lib/utils";
import { Issue, Project } from "@/types/dashboard";
import IssueCard from "../project/issue-card";

type StatusType = "open" | "in_progress" | "resolved" | "closed";

const issueFilters = [
  { label: "Open", value: "open", borderColor: "border-grayBorders" },
  {
    label: "In Progress",
    value: "in_progress",
    borderColor: "border-grayBorders",
  },
  { label: "Resolved", value: "resolved", borderColor: "border-grayBorders" },
  { label: "Closed", value: "closed", borderColor: "border-grayBorders" },
];

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Priority", value: "priority" },
];

type SortOption = "newest" | "oldest" | "priority";

const MyProjectCard = ({
  project,
  isMyProject,
}: {
  project: Project;
  isMyProject?: boolean;
}) => {
  const progressPercentage = calculateProgressPercentage(
    project.issues as Issue[]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusType | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const filteredAndSortedIssues = useMemo(() => {
    let filtered = project.issues?.filter((issue) => {
      // Search filter
      const matchesSearch = (issue as Issue).title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = selectedStatus
        ? (issue as Issue).status === selectedStatus
        : true;

      return matchesSearch && matchesStatus;
    });

    // Sort issues
    return filtered?.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          // You might want to add createdAt to your Issue type
          return (
            new Date((b as Issue).id).getTime() -
            new Date((a as Issue).id).getTime()
          );
        case "oldest":
          return (
            new Date((a as Issue).id).getTime() -
            new Date((b as Issue).id).getTime()
          );
        case "priority":
          // Sort by priority (you might want to add priority levels to your types)
          return (b as Issue).priority.localeCompare((a as Issue).priority);
        default:
          return 0;
      }
    });
  }, [project.issues, searchQuery, selectedStatus, sortBy]);

  return (
    <div className="flex flex-col w-full">
      <main className="flex flex-1 flex-col gap-4 lg:gap-6 w-full">
        <Card className="flex flex-col gap-2 py-4 bg-darkGray text-white w-full border-none">
          <div className="flex items-center justify-start gap-2 px-4">
            <h3 className="font-medium text-white text-lg">{project?.title}</h3>
            <Badge
              className="font-medium !text-xs"
              icon={<GitPullRequest className="h-4 w-4 text-primary2" />}
              variant="outline"
            >
              {project.issues?.length} issues
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
              Progress
              <Progress className="w-20 ml-2" value={progressPercentage} />
              <span className="text-xs">{progressPercentage}%</span>
            </Badge>
          </div>
          <p className="text-white font-light text-sm px-4 py-2">
            {project.description}
          </p>
          <span className="w-full h-px"></span>
          <Tabs defaultValue={!isMyProject ? "issues" : "open-issues"}>
            {!isMyProject ? (
              <TabsList className="p-4">
                <TabsTrigger value="issues">
                  Issues ({project.issues?.length})
                </TabsTrigger>
                <TabsTrigger value="collabuters">Collabuters</TabsTrigger>
                <TabsTrigger value="latest-activity">
                  Latest Activity
                </TabsTrigger>
              </TabsList>
            ) : (
              <TabsList className="p-4">
                <TabsTrigger value="open-issues">
                  Open issues ({project.issues?.length})
                </TabsTrigger>
                <TabsTrigger value="done-issues">Done issues</TabsTrigger>
              </TabsList>
            )}
            {!isMyProject ? (
              <TabsContent className="p-4 flex flex-col gap-y-4" value="issues">
                <SearchFilterBar
                  placeholder="Search Issues"
                  filters={issueFilters}
                  sortOptions={sortOptions}
                  onChange={setSearchQuery}
                  onFilterChange={(value) =>
                    setSelectedStatus(value as StatusType)
                  }
                  onSortChange={(value) => setSortBy(value as SortOption)}
                  selectedFilter={selectedStatus}
                  selectedSort={sortBy}
                />
                <div className="flex flex-col gap-4">
                  {filteredAndSortedIssues?.map((issue, index) => (
                    <IssueCard
                      key={index}
                      issue={issue as Issue}
                      projectTitle={project.title}
                    />
                  ))}
                </div>
              </TabsContent>
            ) : (
              <TabsContent
                className="p-4 flex flex-col gap-y-4"
                value="open-issues"
              >
                <SearchFilterBar
                  placeholder="Search Issues"
                  filters={issueFilters}
                  sortOptions={sortOptions}
                  onChange={setSearchQuery}
                  onFilterChange={(value) =>
                    setSelectedStatus(value as StatusType)
                  }
                  onSortChange={(value) => setSortBy(value as SortOption)}
                  selectedFilter={selectedStatus}
                  selectedSort={sortBy}
                />
                <div className="flex flex-col gap-4">
                  {filteredAndSortedIssues?.map((issue, index) => (
                    <IssueCard
                      key={index}
                      issue={issue as Issue}
                      projectTitle={project.title}
                      isMyProject={isMyProject}
                    />
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </Card>
      </main>
    </div>
  );
};

export default MyProjectCard;
