"use client";

import { useState, useEffect } from "react";
import { Layers } from "lucide-react";
import { GeneratedProject } from "@/types/wizard";
import { motion } from "framer-motion";
import React from "react";
import { GanttChart } from "./gantt-chart";

interface ProjectGeneratorProps {
  projectInfo: {
    name: string;
    description: string;
    industries: string[];
    projectPlatforms: { value: string; isCore?: boolean }[];
  };
  onProjectsChange: (projects: GeneratedProject[]) => void;
  isLoading: boolean;
  suggestedProjects: GeneratedProject[];
  totalEstimatedDuration?: number;
  criticalPath?: string[];
  parallelizationOpportunities?: Array<{
    projectIds: string[];
    description: string;
  }>;
}

const getLanguageIcon = (language: string) => {
  const languageMap: Record<string, string> = {
    typescript: "ts.svg",
    javascript: "js.svg",
    python: "python.svg",
    java: "java.svg",
    kotlin: "kotlin.png",
    swift: "swift.svg",
    dart: "dart.svg",
    go: "go.svg",
    rust: "rust.svg",
    php: "php.svg",
    ruby: "ruby.svg",
    "c++": "c++.svg",
    "c#": "csharp.svg",
    scala: "scala.svg",
  };

  const fileName = languageMap[language.toLowerCase()] || "js.svg";
  return `/languages/${fileName}`;
};

const getProjectTypeColors = (platform: string) => {
  const platformLower = platform.toLowerCase();

  if (platformLower.includes("frontend") || platformLower.includes("web")) {
    return {
      primary: "bg-gradient-to-br from-blue-500/90 to-cyan-600/90",
      secondary: "bg-blue-500/10",
      accent: "text-blue-400",
      border: "border-blue-500/20",
      glow: "shadow-blue-500/25",
      dot: "bg-blue-400",
    };
  }

  if (
    platformLower.includes("api") ||
    platformLower.includes("core") ||
    platformLower.includes("backend")
  ) {
    return {
      primary: "bg-gradient-to-br from-green-500/90 to-emerald-600/90",
      secondary: "bg-green-500/10",
      accent: "text-green-400",
      border: "border-green-500/20",
      glow: "shadow-green-500/25",
      dot: "bg-green-400",
    };
  }

  if (platformLower.includes("auth")) {
    return {
      primary: "bg-gradient-to-br from-orange-500/90 to-amber-600/90",
      secondary: "bg-orange-500/10",
      accent: "text-orange-400",
      border: "border-orange-500/20",
      glow: "shadow-orange-500/25",
      dot: "bg-orange-400",
    };
  }

  if (platformLower.includes("ai") || platformLower.includes("processing")) {
    return {
      primary: "bg-gradient-to-br from-purple-500/90 to-pink-600/90",
      secondary: "bg-purple-500/10",
      accent: "text-purple-400",
      border: "border-purple-500/20",
      glow: "shadow-purple-500/25",
      dot: "bg-purple-400",
    };
  }

  return {
    primary: "bg-gradient-to-br from-gray-500/90 to-slate-600/90",
    secondary: "bg-gray-500/10",
    accent: "text-gray-400",
    border: "border-gray-500/20",
    glow: "shadow-gray-500/25",
    dot: "bg-gray-400",
  };
};

export function ProjectGenerator({
  projectInfo,
  onProjectsChange,
  isLoading,
  suggestedProjects,
  totalEstimatedDuration = 0,
  criticalPath = [],
  parallelizationOpportunities = [],
}: ProjectGeneratorProps) {
  const [projects, setProjects] =
    useState<GeneratedProject[]>(suggestedProjects);

  // Update projects when suggestedProjects changes
  useEffect(() => {
    if (suggestedProjects.length > 0) {
      setProjects(suggestedProjects);
      onProjectsChange(suggestedProjects);
    }
  }, [suggestedProjects, onProjectsChange]);

  const handleProjectsUpdate = (updatedProjects: GeneratedProject[]) => {
    setProjects(updatedProjects);
    onProjectsChange(updatedProjects);
  };

  return (
    <div className="relative min-h-[600px] flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">
            Development Projects
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Based on your selected platforms, here are the development projects
            that will be created for developers to work on.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">
                Generating Project Timeline
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Creating a detailed project breakdown with dependencies and
                timeline...
              </p>
            </div>

            <motion.div className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl border border-zinc-800/50 p-12">
              <div className="space-y-8">
                {/* Loading header */}
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-gray-700 rounded w-1/3 mx-auto"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
                </div>

                {/* Loading timeline */}
                <div className="space-y-6">
                  <div className="flex">
                    <div className="w-80 flex-shrink-0 pr-6">
                      <div className="h-6 bg-gray-700 rounded w-24 animate-pulse"></div>
                    </div>
                    <div className="flex-1 grid grid-cols-8 gap-1">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-700 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Loading project rows */}
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="flex items-center"
                    >
                      <div className="w-80 flex-shrink-0 pr-6">
                        <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
                          <div className="animate-pulse space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-gray-700 rounded-xl"></div>
                              <div className="space-y-2 flex-1">
                                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 relative h-16 flex items-center">
                        <div className="w-full grid grid-cols-8 gap-1 relative">
                          {Array.from({ length: 8 }).map((_, j) => (
                            <div
                              key={j}
                              className="h-12 border-r border-zinc-800/30 last:border-r-0"
                            />
                          ))}
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: i * 0.2 + 0.5, duration: 0.8 }}
                            className="absolute inset-y-0 flex items-center"
                            style={{
                              left: `${Math.random() * 30}%`,
                              width: `${20 + Math.random() * 40}%`,
                            }}
                          >
                            <div className="w-full h-8 rounded-xl bg-gradient-to-r from-gray-600 to-gray-500 animate-pulse">
                              <div className="w-full h-full rounded-xl bg-gradient-to-r from-white/10 to-transparent" />
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        ) : projects.length > 0 ? (
          <GanttChart
            projects={projects}
            totalEstimatedDuration={totalEstimatedDuration}
            criticalPath={criticalPath}
            parallelizationOpportunities={parallelizationOpportunities}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative bg-zinc-900/50 backdrop-blur-sm rounded-3xl border border-zinc-800/50 p-12 text-center min-h-[320px] flex flex-col items-center justify-center"
          >
            <div className="space-y-6">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary2/20 to-primary/20 flex items-center justify-center">
                <Layers className="w-8 h-8 text-primary2" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">
                  No projects generated yet
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Projects will be generated based on your selected platforms
                  and requirements.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
