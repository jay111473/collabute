"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project } from "@/types/dashboard";
import { CircleUser } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchFilterBar from "@/components/dashboard/project/search-filter-bar";
import ProjectPageComponent from "../projects";

const projectTypeFilters = [
  { label: "All", value: "all" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
];

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];
const MyProjectsComponent = ({ projects }: { projects: Project[] }) => {
  return (
    <div className="flex flex-col">
      <header className="flex h-14 justify-between items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <h3 className="text-lg dark:text-white">My Projects</h3>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-opacity-50"
        >
          <CircleUser className="h-5 w-5" />
        </Button>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-[400px] grid-cols-2 mb-6 ">
            <TabsTrigger value="projects">My Projects</TabsTrigger>
            <TabsTrigger value="issues">My Issues</TabsTrigger>
          </TabsList>
          <TabsContent value="projects">
            {projects.map((project) => (
              <ProjectPageComponent
                key={project.id}
                project={project}
                isMyProject={true}
              />
            ))}
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
            {/* <div className="grid gap-4 mt-6">
              {projects?.map((project) => (
                <IssueCard key={project.id} issue={project} projectTitle={""} />
              ))}
            </div> */}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MyProjectsComponent;
