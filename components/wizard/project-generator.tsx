"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Code,
  Layers,
  CheckCircle,
} from "lucide-react";
import { GeneratedProject } from "@/types/wizard";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "@/lib/utils/platform-utils";
import React from "react";

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
      <div className="w-full max-w-5xl mx-auto space-y-8">
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
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-zinc-900/50 backdrop-blur-sm rounded-3xl border border-zinc-800/50 p-8 min-h-[320px]"
              >
                <div className="animate-pulse space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gray-700 rounded-2xl"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, index) => {
              const colors = getProjectTypeColors(project.platform);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{
                    y: -8,
                    transition: { duration: 0.3, ease: "easeOut" },
                  }}
                  className={cn(
                    "group relative bg-zinc-900/80 backdrop-blur-sm rounded-3xl border transition-all duration-500",
                    "hover:shadow-2xl hover:shadow-black/20 cursor-pointer overflow-hidden min-h-[320px]",
                    colors.border
                  )}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 via-transparent to-zinc-900/40" />

                  {/* Glow Effect */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-3xl transition-all duration-500 opacity-0 group-hover:opacity-100",
                      `shadow-2xl ${colors.glow}`
                    )}
                  />

                  {/* Content Container */}
                  <div className="relative z-10 p-8 h-full flex flex-col">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "relative p-4 rounded-2xl shadow-lg",
                            colors.primary
                          )}
                        >
                          <PlatformIcon
                            platform={project.platform
                              .toLowerCase()
                              .replace(" ", "-")}
                            className="h-6 w-6 text-white drop-shadow-sm"
                            size="lg"
                            useDefaultColor={false}
                          />

                          {/* Shine effect */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-white/90 transition-colors">
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-green-400 font-medium">
                              Ready to develop
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold",
                          colors.secondary,
                          colors.accent
                        )}
                      >
                        #{index + 1}
                      </div>
                    </div>

                    {/* Deliverable Section */}
                    <div
                      className={cn(
                        "p-4 rounded-2xl mb-6 border",
                        colors.secondary,
                        colors.border
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={cn("h-2 w-2 rounded-full", colors.dot)}
                        />
                        <span className="text-sm font-medium text-gray-300">
                          Deliverable
                        </span>
                      </div>
                      <p className="text-white font-semibold text-lg">
                        {project.platform}
                      </p>
                    </div>

                    {/* Tech Stack Section */}
                    <div className="flex-1 space-y-4">
                      <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Tech Stack
                      </h4>

                      <div className="space-y-3">
                        {/* Framework */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-zinc-700/50">
                              <Layers className="h-4 w-4 text-gray-300" />
                            </div>
                            <span className="text-sm text-gray-400">
                              Framework
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-white">
                            {project.framework}
                          </span>
                        </div>

                        {/* Language */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-zinc-700/50">
                              <Code className="h-4 w-4 text-gray-300" />
                            </div>
                            <span className="text-sm text-gray-400">
                              Language
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <img
                              src={getLanguageIcon(project.language)}
                              alt={project.language}
                              className="w-5 h-5 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            <span className="text-sm font-semibold text-white">
                              {project.language}
                            </span>
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-zinc-700/50">
                              <Clock className="h-4 w-4 text-gray-300" />
                            </div>
                            <span className="text-sm text-gray-400">
                              Timeline
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-green-400">
                            {project.estimatedTimeline}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {projects.length === 0 && !isLoading && (
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
