"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EnhancedProject } from "@/types/convex";
import { FaCube } from "react-icons/fa";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProjectListItemProps {
  project: EnhancedProject;
  viewMode: "list" | "grid";
}

const ProjectListItem = ({ project, viewMode }: ProjectListItemProps) => {
  return (
    <Link href={`/dashboard/explore/${project.slug}`}>
      <div className="bg-[#1a1a1a] rounded-xl p-5 border border-neutral-800 hover:border-neutral-700 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FaCube className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-semibold text-white">
              {project.title}
            </h3>
            <Badge className="rounded-full text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/40">
              {project.type === "ai_ml"
                ? "Back-end"
                : project.type === "frontend"
                  ? "Front-end"
                  : project.type === "mobile"
                    ? "Mobile"
                    : project.type === "backend"
                      ? "Back-end"
                      : "Other"}
            </Badge>
          </div>

          <div className="text-right">
            <div className="text-xl font-semibold text-white">
              {project.issueCount || 0}
            </div>
            <div className="text-xs text-neutral-400">Tasks</div>
          </div>
        </div>

        <p className="text-neutral-400 text-sm mt-2 mb-4 line-clamp-2">
          {project.description}
        </p>

        <div
          className={cn(
            "flex items-center justify-between",
            viewMode === "grid" && "flex-col gap-2 items-start"
          )}
        >
          <div className="flex items-center gap-6 text-sm text-neutral-400 mb-4">
            <span>
              Budget{" "}
              <span className="font-medium text-white">
                ${project.budget?.toLocaleString() || 0}
              </span>
            </span>
            <span>
              Deadline{" "}
              <span className="font-medium text-white">
                {project.deadlineText || "No deadline"}
              </span>
            </span>
            <span>
              Team{" "}
              <span className="font-medium text-white">
                {project.collaboratorCount || 0}
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span
              className={cn(
                "text-sm text-neutral-400 mr-2",
                viewMode === "grid" && "w-full text-left"
              )}
            >
              Progress
            </span>
            <div
              className={cn(
                "flex items-center gap-x-2",
                viewMode === "grid" && "w-full justify-between"
              )}
            >
              <Progress
                className="w-28 h-2 bg-slate-800"
                value={project.progress || 0}
              />
              <span className="text-sm font-medium text-white">
                {project.progress || 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-3">
          <div className="text-sm text-neutral-400 mb-2">Skills</div>
          <div className="flex flex-wrap gap-2">
            {project.stacks?.slice(0, 6).map((stack, index) => (
              <span
                key={index}
                className="text-xs text-white bg-[#2a2a2a] px-2.5 py-1 rounded-md"
              >
                {stack}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectListItem;
