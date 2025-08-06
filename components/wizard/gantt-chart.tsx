"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Users, Zap, ChevronRight, Calendar, Target, AlertCircle, CheckCircle2, Play } from "lucide-react";
import { GeneratedProject } from "@/types/wizard";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "@/lib/utils/platform-utils";

interface GanttChartProps {
  projects: GeneratedProject[];
  totalEstimatedDuration: number;
  criticalPath: string[];
  parallelizationOpportunities: Array<{
    projectIds: string[];
    description: string;
  }>;
  trackTasks?: any[]; // Optional track tasks data
}

interface ProjectSchedule {
  project: GeneratedProject;
  startWeek: number;
  endWeek: number;
  isOnCriticalPath: boolean;
  canParallelize: boolean;
}

const getProjectTypeColors = (platform: string) => {
  const platformLower = platform.toLowerCase();

  if (platformLower.includes("frontend") || platformLower.includes("web")) {
    return {
      primary: "from-blue-500 to-cyan-500",
      light: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-400",
      glow: "shadow-blue-500/20",
    };
  }

  if (
    platformLower.includes("api") ||
    platformLower.includes("core") ||
    platformLower.includes("backend")
  ) {
    return {
      primary: "from-green-500 to-emerald-500",
      light: "bg-green-500/10",
      border: "border-green-500/30",
      text: "text-green-400",
      glow: "shadow-green-500/20",
    };
  }

  if (platformLower.includes("auth")) {
    return {
      primary: "from-orange-500 to-amber-500",
      light: "bg-orange-500/10",
      border: "border-orange-500/30",
      text: "text-orange-400",
      glow: "shadow-orange-500/20",
    };
  }

  if (platformLower.includes("ai") || platformLower.includes("processing")) {
    return {
      primary: "from-purple-500 to-pink-500",
      light: "bg-purple-500/10",
      border: "border-purple-500/30",
      text: "text-purple-400",
      glow: "shadow-purple-500/20",
    };
  }

  return {
    primary: "from-gray-500 to-slate-500",
    light: "bg-gray-500/10",
    border: "border-gray-500/30",
    text: "text-gray-400",
    glow: "shadow-gray-500/20",
  };
};

export function GanttChart({
  projects,
  totalEstimatedDuration,
  criticalPath,
  parallelizationOpportunities,
  trackTasks = [],
}: GanttChartProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  // Calculate task data for each project
  const projectTaskData = useMemo(() => {
    const dataMap = new Map();
    
    // Map tracks to projects based on platform/category matching
    projects.forEach(project => {
      const relatedTracks = trackTasks.filter(track => {
        const platformMatch = track.platform?.toLowerCase().includes(project.platform?.toLowerCase()) ||
                            project.platform?.toLowerCase().includes(track.platform?.toLowerCase());
        const categoryMatch = track.trackCategory?.toLowerCase().includes(project.platform?.toLowerCase()) ||
                            project.platform?.toLowerCase().includes(track.trackCategory?.toLowerCase());
        return platformMatch || categoryMatch;
      });
      
      const totalTasks = relatedTracks.reduce((sum, track) => sum + (track.totalTasksCount || 0), 0);
      const totalDays = relatedTracks.reduce((sum, track) => sum + (track.totalEstimatedDays || 0), 0);
      
      dataMap.set(project.id, {
        taskCount: totalTasks || 15, // Default to 15 if no tasks found
        totalDays: totalDays || project.durationInWeeks * 5, // Default to duration * 5 days/week
        tracks: relatedTracks
      });
    });
    
    return dataMap;
  }, [projects, trackTasks]);

  // Calculate project schedule based on dependencies
  const projectSchedule = useMemo(() => {
    const schedule: ProjectSchedule[] = [];
    const projectMap = new Map(projects.map(p => [p.id, p]));
    const completedProjects = new Set<string>();
    const projectEndTimes = new Map<string, number>();

    // Helper function to calculate start time for a project
    const calculateStartTime = (project: GeneratedProject): number => {
      if (project.dependencies.length === 0) {
        return 0; // Start immediately if no dependencies
      }

      let latestEndTime = 0;
      for (const depId of project.dependencies) {
        const depEndTime = projectEndTimes.get(depId) || 0;
        latestEndTime = Math.max(latestEndTime, depEndTime);
      }
      return latestEndTime;
    };

    // Sort projects by dependencies (topological sort)
    const sortedProjects = [...projects].sort((a, b) => {
      if (a.dependencies.includes(b.id)) return 1;
      if (b.dependencies.includes(a.id)) return -1;
      return a.dependencies.length - b.dependencies.length;
    });

    // Calculate schedule for each project
    for (const project of sortedProjects) {
      const startWeek = calculateStartTime(project);
      const endWeek = startWeek + project.durationInWeeks;
      
      projectEndTimes.set(project.id, endWeek);
      
      const isOnCriticalPath = criticalPath.includes(project.id);
      const canParallelize = parallelizationOpportunities.some(opp => 
        opp.projectIds.includes(project.id)
      );

      schedule.push({
        project,
        startWeek,
        endWeek,
        isOnCriticalPath,
        canParallelize,
      });
    }

    return schedule;
  }, [projects, criticalPath, parallelizationOpportunities]);

  // Generate week headers with better formatting
  const weeks = Array.from({ length: Math.ceil(totalEstimatedDuration) }, (_, i) => {
    const weekNum = i;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (i * 7));
    
    return {
      week: weekNum,
      label: `Week ${weekNum}`,
      shortLabel: `W${weekNum}`,
      dateRange: startDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      isQuarter: weekNum % 4 === 0,
      isMilestone: weekNum % 8 === 0,
    };
  });

  const totalProjects = projects.length;
  const criticalProjects = criticalPath.length;
  const parallelProjects = parallelizationOpportunities.reduce((acc, opp) => acc + opp.projectIds.length, 0);

  return (
    <div className="w-full space-y-8">
      {/* Enhanced Header */}
      <div className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            Project Timeline
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg">
            Visual timeline showing how your projects will be developed with dependencies, critical paths, and parallel opportunities.
          </p>
        </motion.div>
        
        {/* Enhanced Summary Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalEstimatedDuration}</p>
                <p className="text-sm text-gray-400">weeks total</p>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-yellow-500/10">
                <Zap className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{criticalProjects}</p>
                <p className="text-sm text-gray-400">critical projects</p>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-green-500/10">
                <Users className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{parallelProjects}</p>
                <p className="text-sm text-gray-400">parallel tasks</p>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-purple-500/10">
                <Target className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalProjects}</p>
                <p className="text-sm text-gray-400">total projects</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Gantt Chart Container */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-zinc-900/30 backdrop-blur-sm rounded-3xl border border-zinc-800/50 overflow-hidden"
      >
        <div className="p-8">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Enhanced Timeline Header */}
              <div className="flex mb-8">
                {/* Project Names Column */}
                <div className="w-96 flex-shrink-0 pr-8">
                  <div className="h-20 flex items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                        <Calendar className="h-5 w-5 text-blue-400" />
                      </div>
                      Projects
                    </h3>
                  </div>
                </div>
                
                {/* Enhanced Week Headers */}
                <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
                  {weeks.map((week) => (
                    <div key={week.week} className="text-center relative">
                      <div className={cn(
                        "text-sm font-semibold mb-1 transition-colors",
                        week.isMilestone ? "text-yellow-400" : "text-white"
                      )}>
                        {week.shortLabel}
                      </div>
                      <div className="text-xs text-gray-500">
                        {week.dateRange}
                      </div>
                      {week.isMilestone && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced Project Rows */}
              <div className="space-y-3">
                {projectSchedule.map((item, index) => {
                  const colors = getProjectTypeColors(item.project.platform);
                  const isSelected = selectedProject === item.project.id;
                  const isHovered = hoveredProject === item.project.id;
                  
                  return (
                    <motion.div
                      key={item.project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center group"
                      onMouseEnter={() => setHoveredProject(item.project.id)}
                      onMouseLeave={() => setHoveredProject(null)}
                    >
                      {/* Enhanced Project Info */}
                      <div className="w-96 flex-shrink-0 pr-8">
                        <motion.div
                          className={cn(
                            "p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden",
                            isSelected 
                              ? `${colors.light} ${colors.border} shadow-lg ${colors.glow}` 
                              : "bg-zinc-800/30 border-zinc-700/30 hover:bg-zinc-800/50 hover:border-zinc-600/50"
                          )}
                          onClick={() => setSelectedProject(
                            isSelected ? null : item.project.id
                          )}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Background gradient */}
                          <div className={cn(
                            "absolute inset-0 opacity-0 transition-opacity duration-300",
                            `bg-gradient-to-r ${colors.primary}`,
                            (isSelected || isHovered) && "opacity-5"
                          )} />
                          
                          <div className="relative flex items-center gap-4">
                            <div className={cn(
                              "p-3 rounded-xl transition-all duration-300",
                              colors.light,
                              (isSelected || isHovered) && "scale-110"
                            )}>
                              <PlatformIcon
                                platform={item.project.platform.toLowerCase().replace(" ", "-")}
                                className="h-6 w-6"
                                size="sm"
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-white text-base truncate">
                                  {item.project.name}
                                </h4>
                                {item.isOnCriticalPath && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-1"
                                  >
                                    <Zap className="h-4 w-4 text-yellow-400" />
                                    <span className="text-xs text-yellow-400 font-medium">Critical</span>
                                  </motion.div>
                                )}
                                {item.canParallelize && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-1"
                                  >
                                    <Users className="h-4 w-4 text-green-400" />
                                    <span className="text-xs text-green-400 font-medium">Parallel</span>
                                  </motion.div>
                                )}
                              </div>
                              <p className="text-sm text-gray-400 truncate mb-2">
                                {item.project.platform}
                              </p>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-gray-500" />
                                  <span className="text-xs text-gray-400">
                                    {projectTaskData.get(item.project.id)?.totalDays || item.project.durationInWeeks * 5} days
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Target className="h-3 w-3 text-purple-400" />
                                  <span className="text-xs text-purple-400">
                                    {projectTaskData.get(item.project.id)?.taskCount || 15} tasks
                                  </span>
                                </div>
                                {item.project.dependencies.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3 text-orange-400" />
                                    <span className="text-xs text-orange-400">
                                      {item.project.dependencies.length} deps
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Zap className="h-3 w-3 text-blue-400" />
                                  <span className="text-xs text-blue-400 capitalize">
                                    {item.project.priority}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <motion.div
                              animate={{ rotate: isSelected ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Enhanced Timeline Bar */}
                      <div className="flex-1 relative h-20 flex items-center">
                        <div className="w-full grid gap-1 relative" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
                          {/* Enhanced Background grid */}
                          {weeks.map((week) => (
                            <div
                              key={week.week}
                              className={cn(
                                "h-16 border-r last:border-r-0 transition-colors",
                                week.isQuarter ? "border-zinc-600/50" : "border-zinc-800/30",
                                week.isMilestone && "bg-yellow-400/5"
                              )}
                            />
                          ))}
                          
                          {/* Enhanced Project Bar */}
                          <motion.div
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            transition={{ 
                              delay: index * 0.05 + 0.3, 
                              duration: 0.8,
                              ease: "easeOut"
                            }}
                            className="absolute inset-y-0 flex items-center"
                            style={{
                              left: `${(item.startWeek / weeks.length) * 100}%`,
                              width: `${(item.project.durationInWeeks / weeks.length) * 100}%`,
                            }}
                          >
                            <div className={cn(
                              "w-full h-10 rounded-xl shadow-lg transition-all duration-300 relative overflow-hidden",
                              `bg-gradient-to-r ${colors.primary}`,
                              item.isOnCriticalPath && "ring-2 ring-yellow-400/50 ring-offset-2 ring-offset-zinc-900",
                              (isSelected || isHovered) && "h-12 shadow-2xl scale-105",
                              "hover:shadow-xl"
                            )}>
                              {/* Shimmer effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse" />
                              
                              {/* Progress indicator */}
                              <div className="absolute inset-0 flex items-center justify-between px-3">
                                <div className="flex items-center gap-2">
                                  <Play className="h-3 w-3 text-white/80" />
                                  <span className="text-xs font-bold text-white">
                                    Week {item.startWeek}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white">
                                    Week {item.endWeek}
                                  </span>
                                  <CheckCircle2 className="h-3 w-3 text-white/80" />
                                </div>
                              </div>
                              
                              {/* Hover tooltip */}
                              <AnimatePresence>
                                {isHovered && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white whitespace-nowrap z-10"
                                  >
                                    {item.project.name} • {item.project.durationInWeeks} weeks
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-zinc-800"></div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Legend */}
        <div className="px-8 pb-8">
          <div className="bg-zinc-800/30 rounded-2xl p-6 border border-zinc-700/30">
            <h4 className="text-lg font-semibold text-white mb-4">Legend</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500" />
                <span className="text-sm text-gray-300">Frontend</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500" />
                <span className="text-sm text-gray-300">Backend</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500" />
                <span className="text-sm text-gray-300">Authentication</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500" />
                <span className="text-sm text-gray-300">AI/Processing</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-gray-300">Critical Path</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-300">Parallel Tasks</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="text-sm text-gray-300">Milestones</span>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-400" />
                <span className="text-sm text-gray-300">Dependencies</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Selected Project Details */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl border border-zinc-800/50 overflow-hidden"
          >
            {(() => {
              const project = projects.find(p => p.id === selectedProject);
              const schedule = projectSchedule.find(s => s.project.id === selectedProject);
              if (!project || !schedule) return null;

              const colors = getProjectTypeColors(project.platform);

              return (
                <div className="p-8">
                  <div className="flex items-center gap-6 mb-8">
                    <div className={cn("p-4 rounded-2xl", colors.light)}>
                      <PlatformIcon
                        platform={project.platform.toLowerCase().replace(" ", "-")}
                        className="h-8 w-8"
                        size="lg"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{project.name}</h3>
                      <p className="text-gray-400 text-lg">{project.platform}</p>
                      <div className="flex items-center gap-4 mt-2">
                        {schedule.isOnCriticalPath && (
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm text-yellow-400 font-medium">Critical Path</span>
                          </div>
                        )}
                        {schedule.canParallelize && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-green-400 font-medium">Can Parallelize</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-zinc-800/30 rounded-2xl p-6 border border-zinc-700/30">
                      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-400" />
                        Timeline
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-white font-medium">{project.durationInWeeks} weeks</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Start Week:</span>
                          <span className="text-white font-medium">{schedule.startWeek}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">End Week:</span>
                          <span className="text-white font-medium">{schedule.endWeek}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-800/30 rounded-2xl p-6 border border-zinc-700/30">
                      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-400" />
                        Resources
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Team Size:</span>
                          <span className="text-white font-medium">{project.resourceRequirements.teamSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Skill Level:</span>
                          <span className="text-white font-medium capitalize">{project.resourceRequirements.skillLevel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Priority:</span>
                          <span className={cn(
                            "font-medium capitalize",
                            project.priority === "high" ? "text-red-400" :
                            project.priority === "medium" ? "text-yellow-400" : "text-green-400"
                          )}>{project.priority}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-800/30 rounded-2xl p-6 border border-zinc-700/30">
                      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-400" />
                        Tech Stack
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Framework:</span>
                          <span className="text-white font-medium">{project.framework}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Language:</span>
                          <span className="text-white font-medium">{project.language}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-800/30 rounded-2xl p-6 border border-zinc-700/30">
                      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                        Deliverables
                      </h4>
                      <div className="text-sm">
                        <span className="text-white font-medium">{project.deliverables.length}</span>
                        <span className="text-gray-400 ml-1">items</span>
                      </div>
                    </div>
                  </div>

                  {project.dependencies.length > 0 && (
                    <div className="bg-zinc-800/30 rounded-2xl p-6 border border-zinc-700/30">
                      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-400" />
                        Dependencies
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {project.dependencies.map((depId) => {
                          const depProject = projects.find(p => p.id === depId);
                          if (!depProject) return null;
                          
                          const depColors = getProjectTypeColors(depProject.platform);
                          
                          return (
                            <div
                              key={depId}
                              className="flex items-center gap-3 p-3 rounded-xl bg-zinc-700/30 border border-zinc-600/30"
                            >
                              <div className={cn("p-2 rounded-lg", depColors.light)}>
                                <PlatformIcon
                                  platform={depProject.platform.toLowerCase().replace(" ", "-")}
                                  className="h-4 w-4"
                                  size="sm"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{depProject.name}</p>
                                <p className="text-xs text-gray-400">{depProject.platform}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 