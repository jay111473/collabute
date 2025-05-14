"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Issue, Project } from "@/types/dashboard";
import SearchFilterBar from "@/components/dashboard/project/search-filter-bar";
import IssueCard from "../project/issue-card";
import MyProjectCard from "../projects";
import { EmptyState } from "./EmptyState";
import { EmptyIssues } from "./EmptyIssues";

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

/**
 * MyProjectsComponent displays a user's projects and issues
 * Shows an empty state when no projects exist
 */
const MyProjectsComponent = ({
  projects,
  issues,
}: {
  projects: Project[];
  issues: Issue[];
}) => {
  const hasProjects = projects.length > 0;
  const hasIssues = issues.length > 0;

  // If user has no projects and no issues, show the main empty state
  if (!hasProjects && !hasIssues) {
    return (
      <div className="flex flex-col w-full bg-black">
        <main className="flex flex-1 flex-col">
          <EmptyState />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-black">
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-[400px] grid-cols-2 mb-6 ">
            <TabsTrigger value="projects">My Projects</TabsTrigger>
            <TabsTrigger value="issues">My Issues</TabsTrigger>
          </TabsList>
          <TabsContent value="projects">
            {hasProjects ? (
              projects.map((project) => (
                <MyProjectCard
                  key={project.id}
                  project={project}
                  isMyProject={true}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </TabsContent>
          <TabsContent value="issues">
            <SearchFilterBar
              placeholder="Search issues..."
              filters={[
                { label: "All", value: "all" },
                { label: "High Priority", value: "high" },
                { label: "Medium Priority", value: "medium" },
                { label: "Low Priority", value: "low" },
              ]}
              sortOptions={sortOptions}
              onChange={() => {}}
              onFilterChange={() => {}}
              onSortChange={() => {}}
              selectedFilter="all"
              selectedSort="newest"
            />
            <div className="grid gap-4 mt-6">
              {hasIssues ? (
                issues.map((issue) => (
                  <IssueCard isMyProject={true} key={issue.id} issue={issue} />
                ))
              ) : (
                <EmptyIssues />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MyProjectsComponent;
