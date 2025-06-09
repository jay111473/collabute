import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Clock,
  Target,
  FileText,
  Code,
  TestTube,
  Settings,
  Palette,
  Database,
  Shield,
  Globe,
  Smartphone,
  Server,
  BarChart3,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectTrack, TrackTasks, Task } from "@/types/wizard";

interface TrackTasksGeneratorProps {
  projectInfo: any;
  tracks: ProjectTrack[];
  competitors: any[];
  businessComparison: any;
  isLoading?: boolean;
  onTasksGenerated?: (tasks: TrackTasks[]) => void;
}

const categoryIcons = {
  "product-planning": BarChart3,
  "ui-ux-design": Palette,
  "web-development": Globe,
  "ios-development": Smartphone,
  "android-development": Smartphone,
  "backend-development": Server,
  "api-development": Code,
  "database-development": Database,
  "devops-deployment": Settings,
  "qa-testing": TestTube,
  "integration-testing": Zap,
  "security-testing": Shield,
};

const priorityColors = {
  high: "bg-red-100 text-red-800 border border-red-300 shadow-sm",
  medium: "bg-amber-100 text-amber-800 border border-amber-300 shadow-sm",
  low: "bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm",
};

const skillLevelColors = {
  junior: "bg-blue-100 text-blue-800 border border-blue-300 shadow-sm",
  mid: "bg-purple-100 text-purple-800 border border-purple-300 shadow-sm",
  senior: "bg-orange-100 text-orange-800 border border-orange-300 shadow-sm",
};

// Entrepreneur-friendly labels
const priorityLabels = {
  high: "Critical",
  medium: "Important",
  low: "Optional",
};

const skillLevelLabels = {
  junior: "Entry Level",
  mid: "Standard",
  senior: "Expert",
};

function TaskListItem({ task, trackId }: { task: Task; trackId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-all duration-200"
    >
      <div className="flex items-center gap-4 p-4">
        {/* Task ID */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded bg-zinc-700/50 flex items-center justify-center">
            <span className="text-xs font-mono text-gray-400">
              {task.id.split("-").pop()?.slice(0, 2).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Task Name */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white text-sm truncate group-hover:text-primary2 transition-colors">
            {task.name}
          </h4>
        </div>

        {/* Labels */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-200",
              priorityColors[task.priority]
            )}
          >
            {priorityLabels[task.priority]}
          </span>
          <span
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-200",
              skillLevelColors[task.skillLevel]
            )}
          >
            {skillLevelLabels[task.skillLevel]}
          </span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{task.estimatedHours}h</span>
        </div>
      </div>
    </motion.div>
  );
}

function TrackSection({
  track,
  trackTasks,
  isLoading,
  isCompleted,
}: {
  track: ProjectTrack;
  trackTasks?: TrackTasks;
  isLoading: boolean;
  isCompleted: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const Icon =
    categoryIcons[track.category as keyof typeof categoryIcons] || Code;

  return (
    <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-900/30">
      {/* Track Header */}
      <div
        className="flex items-center gap-3 p-4 bg-zinc-900/50 border-b border-zinc-800/30 cursor-pointer hover:bg-zinc-800/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400"
        >
          <ChevronRight className="w-4 h-4" />
        </motion.div>

        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary2/20 to-darkPrimary/20 flex items-center justify-center border border-primary2/30">
          <Icon className="w-4 h-4 text-primary2" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm">{track.name}</h3>
          <p className="text-gray-400 text-xs">
            {track.platform && `${track.platform} • `}
            Week {track.startWeek}-{track.endWeek} ({track.durationInWeeks}w)
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          {isCompleted && trackTasks && (
            <>
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>{trackTasks.tasks.length} tasks</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{trackTasks.totalEstimatedHours}h</span>
              </div>
            </>
          )}

          {isLoading && (
            <div className="flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin text-primary2" />
              <span>Generating...</span>
            </div>
          )}
        </div>
      </div>

      {/* Track Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary2/20 to-darkPrimary/20 rounded-full blur-lg"></div>
                  <Loader2 className="relative h-8 w-8 animate-spin text-primary2" />
                </div>
                <p className="text-gray-400 text-sm text-center">
                  Generating tasks for {track.name}...
                </p>
              </div>
            )}

            {isCompleted && trackTasks && (
              <div>
                {/* Task List */}
                {trackTasks.tasks.map((task) => (
                  <TaskListItem key={task.id} task={task} trackId={track.id} />
                ))}
              </div>
            )}


          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TrackTasksGenerator({
  projectInfo,
  tracks,
  competitors,
  businessComparison,
  isLoading = false,
  onTasksGenerated,
}: TrackTasksGeneratorProps) {
  const [completedTracks, setCompletedTracks] = useState<TrackTasks[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectContext, setProjectContext] = useState<any>(null);

  useEffect(() => {
    if (tracks.length > 0 && completedTracks.length === 0 && !isGenerating) {
      generateAllTracks();
    }
  }, [tracks, projectInfo]);

  const generateAllTracks = async (retryCount = 0) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/wizard-track-tasks-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectInfo,
          tracks,
          competitors,
          businessComparison,
          projectContext,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCompletedTracks(result.trackTasks);
        setIsGenerating(false);
        onTasksGenerated?.(result.trackTasks);
      } else {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        
        // Retry once if it's a truncation error
        if (retryCount === 0 && errorData.details?.includes("truncated")) {
          console.log("Retrying task generation...");
          setTimeout(() => generateAllTracks(1), 2000);
          return;
        }
        
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Failed to generate track tasks:", error);
      
      // Retry once on network/parsing errors
      if (retryCount === 0) {
        console.log("Retrying task generation...");
        setTimeout(() => generateAllTracks(1), 2000);
        return;
      }
      
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary2/20 to-darkPrimary/20 rounded-full blur-xl"></div>
            <Loader2 className="relative h-10 w-10 animate-spin text-primary2 mx-auto" />
          </div>
          <div className="space-y-2">
            <p className="text-white font-medium">Preparing task generation</p>
            <p className="text-gray-400 text-sm">
              Setting up development tracks...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalTasks = completedTracks.reduce(
    (sum, track) => sum + track.tasks.length,
    0
  );
  const totalHours = completedTracks.reduce(
    (sum, track) => sum + track.totalEstimatedHours,
    0
  );

  return (
    <div className="space-y-8">
      {(completedTracks.length > 0 || isGenerating) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Tasks</p>
                <p className="text-xl font-bold text-white">{totalTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Hours</p>
                <p className="text-xl font-bold text-white">{totalHours}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Progress</p>
                <p className="text-xl font-bold text-white">
                  {completedTracks.length}/{tracks.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Track Sections List */}
      <div className="space-y-4">
        {tracks.map((track) => {
          const trackTasks = completedTracks.find(
            (t) => t.trackId === track.id
          );
          const isCurrentlyGenerating = isGenerating && !trackTasks;
          const isCompleted = !!trackTasks;

          return (
            <TrackSection
              key={track.id}
              track={track}
              trackTasks={trackTasks}
              isLoading={isCurrentlyGenerating}
              isCompleted={isCompleted}
            />
          );
        })}
      </div>
    </div>
  );
}
