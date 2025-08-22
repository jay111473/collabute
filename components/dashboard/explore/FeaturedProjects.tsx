"use client";

import { ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EnhancedProject } from "@/types/convex";
import Link from "next/link";
import { FaCube } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";

interface FeaturedProjectsProps {
  featuredProjects: EnhancedProject[];
}

const FeaturedProjects = ({ featuredProjects }: FeaturedProjectsProps) => {
  if (!featuredProjects || featuredProjects.length === 0) {
    return null;
  }

  console.log(featuredProjects[0]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">Featured projects</h2>
        <div className="flex items-center justify-center gap-x-2">
          <button className="text-gray-400 text-xs rounded-md">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="text-white text-xs rounded-md">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {featuredProjects.map((project) => (
            <Link
              key={project._id}
              href={`/dashboard/explore/${project.slug}`}
              className="flex-1 min-w-[400px]"
            >
              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FaCube className="w-5 h-5 text-purple-400" />
                    <h3 className="text-base font-semibold text-white">
                      {project.title}
                    </h3>
                    <Badge className="ml-2 bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs rounded-full px-2 py-1">
                      Back-end
                    </Badge>

                    <div className="flex items-center justify-center border border-gray-400/20 rounded-full p-1.5">
                      <Bookmark className="w-3 h-3 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                    </div>
                  </div>
                  <div className="flex items-center flex-col gap-y-1">
                    <div>
                      <span className="text-white font-semibold text-lg">
                        {project.issueCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                    {project.description}
                  </p>
                  <p className="text-sm text-gray-400 text-right">Tasks</p>
                </div>

                <Separator className="mt-2.5 bg-gray-400/20" />

                <div className="flex items-center gap-6 mt-4 text-sm text-gray-400">
                  <span>
                    Budget{" "}
                    <span className="text-white font-medium">
                      ${project.budget?.toLocaleString() || 0}
                    </span>
                  </span>
                  <span>
                    Deadline{" "}
                    <span className="text-white font-medium">
                      {project.deadlineText || "N/A"}
                    </span>
                  </span>
                  <span>
                    Team{" "}
                    <span className="text-white font-medium">
                      {project.collaboratorCount || 0}
                    </span>
                  </span>
                </div>

                <Separator className="mt-2.5 bg-gray-400/20" />

                <div className="flex items-center justify-between gap-3 mt-3">
                  <div className="text-sm text-gray-400 flex-1">Progress</div>
                  <div className="flex items-center gap-x-2">
                    <Progress
                      className="h-2 w-[10rem] bg-slate-800 rounded-full"
                      value={project.progress || 0}
                    />
                    <span className="text-sm text-white">
                      {project.progress || 0}%
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Skills</span>
                  <div className="flex gap-2 text-xs text-gray-300">
                    {project.stacks
                      ?.slice(0, 4)
                      .map((stack, index) => <div key={index}>{stack}</div>)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedProjects;
