import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, StarIcon, DollarSignIcon, HashIcon, Clock, Code, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GeneratedProject } from "@/types/wizard";

interface ProjectTimelineProps {
  features: GeneratedProject[];
  onFeaturesChange: (projects: GeneratedProject[]) => void;
}

export function ProjectTimeline({ features: projects, onFeaturesChange }: ProjectTimelineProps) {
  const [selectedProjects, setSelectedProjects] = useState<GeneratedProject[]>(projects);

  // Group projects by platform type
  const projectsByPlatform = projects.reduce((acc, project) => {
    if (!acc[project.platform]) {
      acc[project.platform] = [];
    }
    acc[project.platform].push(project);
    return acc;
  }, {} as Record<string, GeneratedProject[]>);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Development Projects Overview</h2>
        <p className="text-sm text-white/60">
          Review the development projects that will be created for your idea.
        </p>
      </div>

      {Object.entries(projectsByPlatform).map(([platform, platformProjects]) => {
        return (
          <div key={platform} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">
                {platform}
              </h3>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <Badge
                  variant="outline"
                  className="text-xs bg-zinc-800/50 text-zinc-400 border-zinc-700"
                >
                  {platformProjects.length} project{platformProjects.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              {platformProjects.map((project, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-800"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-darkPrimary" />
                      <h4 className="text-sm font-medium text-white">{project.name}</h4>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Layers className="h-3 w-3" />
                          Framework
                        </div>
                        <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                          {project.framework}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Code className="h-3 w-3" />
                          Language
                        </div>
                        <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                          {project.language}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          Timeline
                        </div>
                        <Badge variant="outline" className="border-green-600 text-green-400 text-xs">
                          {project.estimatedTimeline}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="mt-8 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">Project Summary</h3>
            <p className="text-sm text-white/60">Overview of your development projects</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-darkPrimary" />
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {Object.keys(projectsByPlatform).length} platform{Object.keys(projectsByPlatform).length !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-white/60">Different technologies</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {projects.length} total projects
              </p>
              <p className="text-xs text-white/60">Ready for development</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
} 