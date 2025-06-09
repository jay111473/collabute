import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle,
  Clock,
  Target,
  AlertTriangle,
  Zap,
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
  ChevronDown,
  ChevronUp,
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
  high: "bg-red-500/20 text-red-300 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  low: "bg-green-500/20 text-green-300 border-green-500/30",
};

const skillLevelColors = {
  junior: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  mid: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  senior: "bg-orange-500/20 text-orange-300 border-orange-500/30",
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

function TaskCard({ task }: { task: Task }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-zinc-800/50 rounded-lg border border-zinc-700/30 p-3 hover:bg-zinc-700/30 transition-all duration-200 cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-white text-sm leading-tight line-clamp-2">
            {task.name}
          </h4>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
          </motion.div>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2 py-1 rounded text-xs font-medium border",
            priorityColors[task.priority]
          )}>
            {priorityLabels[task.priority]}
          </span>
          <span className={cn(
            "px-2 py-1 rounded text-xs font-medium border",
            skillLevelColors[task.skillLevel]
          )}>
            {skillLevelLabels[task.skillLevel]}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{task.estimatedHours}h</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>{task.deliverables.length} items</span>
          </div>
          {task.dependencies.length > 0 && (
            <div className="flex items-center gap-1" title="This task depends on other tasks">
              <AlertTriangle className="w-3 h-3 text-yellow-400" />
              <span>{task.dependencies.length} deps</span>
            </div>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-zinc-700/30 pt-3 space-y-3"
            >
              <p className="text-gray-300 text-sm leading-relaxed">
                {task.description}
              </p>

              <div>
                <h5 className="text-xs font-medium text-white mb-2">What You'll Get</h5>
                <ul className="space-y-1">
                  {task.deliverables.slice(0, 3).map((deliverable, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-gray-300">
                      <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{deliverable}</span>
                    </li>
                  ))}
                  {task.deliverables.length > 3 && (
                    <li className="text-xs text-gray-500">
                      +{task.deliverables.length - 3} more deliverables...
                    </li>
                  )}
                </ul>
              </div>

              {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.tags.slice(0, 4).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-zinc-700/50 text-gray-400 text-xs rounded border border-zinc-600/30"
                    >
                      {tag}
                    </span>
                  ))}
                  {task.tags.length > 4 && (
                    <span className="px-2 py-1 text-gray-500 text-xs">
                      +{task.tags.length - 4}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function TrackColumn({ 
  track, 
  trackTasks, 
  isLoading, 
  isCompleted 
}: { 
  track: ProjectTrack;
  trackTasks?: TrackTasks;
  isLoading: boolean;
  isCompleted: boolean;
}) {
  const Icon = categoryIcons[track.category as keyof typeof categoryIcons] || Code;

  return (
    <div className="bg-zinc-900/50 rounded-xl border border-zinc-700/50 overflow-hidden">
      <div className="p-4 border-b border-zinc-700/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary2/20 to-darkPrimary/20 flex items-center justify-center border border-primary2/30">
            <Icon className="w-5 h-5 text-primary2" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm truncate">
              {track.name}
            </h3>
            <p className="text-gray-400 text-xs">
              {track.platform && `${track.platform} • `}
              {track.durationInWeeks}w
            </p>
          </div>
        </div>

        {isCompleted && trackTasks && (
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{trackTasks.tasks.length} tasks</span>
            <span>{trackTasks.totalEstimatedHours}h total</span>
          </div>
        )}
      </div>

      <div className="p-4 min-h-[400px]">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary2/20 to-darkPrimary/20 rounded-full blur-lg"></div>
              <Loader2 className="relative h-8 w-8 animate-spin text-primary2" />
            </div>
            <p className="text-gray-400 text-sm text-center">
              Generating tasks...
            </p>
          </div>
        )}

        {isCompleted && trackTasks && (
          <div className="space-y-3">
            {/* Show first 3 tasks clearly */}
            {trackTasks.tasks.slice(0, 3).map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            
            {/* Show remaining tasks with blur effect */}
            {trackTasks.tasks.length > 3 && (
              <div className="relative">
                <div className="space-y-3 blur-sm opacity-60">
                  {trackTasks.tasks.slice(3, 6).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
                
                {/* Overlay with teaser text */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/50 to-transparent flex items-end justify-center pb-4">
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-primary2/20 flex items-center justify-center mx-auto">
                      <Target className="w-4 h-4 text-primary2" />
                    </div>
                    <p className="text-xs text-gray-300 font-medium">
                      +{trackTasks.tasks.length - 3} more tasks
                    </p>
                    <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
                      Complete your project setup to unlock the comprehensive task roadmap that will guide you through every step of development
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!isLoading && !isCompleted && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center border border-zinc-700/30">
                <Clock className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-gray-500 text-sm">Waiting...</p>
            </div>
          </div>
        )}
      </div>
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
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectContext, setProjectContext] = useState<any>(null);

  useEffect(() => {
    if (tracks.length > 0 && completedTracks.length === 0 && !isGenerating) {
      generateNextTrack();
    }
  }, [tracks, projectInfo]);

  const generateNextTrack = async () => {
    if (currentTrackIndex >= tracks.length) return;

    setIsGenerating(true);
    try {
      const currentTrack = tracks[currentTrackIndex];
      
      const response = await fetch("/api/wizard-track-tasks-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectInfo,
          track: currentTrack,
          competitors,
          businessComparison,
          projectContext,
          previousTracks: completedTracks,
        }),
      });

      if (response.ok) {
        const trackTasks = await response.json();
        const newCompletedTracks = [...completedTracks, trackTasks];
        setCompletedTracks(newCompletedTracks);
        
        // Check if there are more tracks to generate
        const nextIndex = currentTrackIndex + 1;
        if (nextIndex < tracks.length) {
          // Move to next track and continue generating
          setCurrentTrackIndex(nextIndex);
          // Small delay to show the completed track before starting next
          setTimeout(() => {
            generateNextTrack();
          }, 300);
        } else {
          // All tracks completed
          setCurrentTrackIndex(nextIndex);
          setIsGenerating(false);
          onTasksGenerated?.(newCompletedTracks);
        }
      } else {
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Failed to generate track tasks:", error);
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
            <p className="text-white font-medium">
              Preparing task generation
            </p>
            <p className="text-gray-400 text-sm">
              Setting up development tracks...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalTasks = completedTracks.reduce((sum, track) => sum + track.tasks.length, 0);
  const totalHours = completedTracks.reduce((sum, track) => sum + track.totalEstimatedHours, 0);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-primary2 to-darkPrimary bg-clip-text text-transparent">
          Development Tasks
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Your project broken down into clear, actionable tasks. Each track shows the essential steps to bring your vision to life.
        </p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tracks.map((track, index) => {
          const trackTasks = completedTracks.find(t => t.trackId === track.id);
          const isCurrentlyGenerating = index === currentTrackIndex && isGenerating;
          const isCompleted = !!trackTasks;

          return (
            <TrackColumn
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