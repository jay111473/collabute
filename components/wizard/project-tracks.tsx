import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  BarChart3,
  Smartphone,
  Globe,
  Server,
  Database,
  Shield,
  Zap,
  Users,
  Palette,
  FileText,
  TestTube,
  Link,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectTrack } from "@/types/wizard";

interface ProjectTracksProps {
  onTracksChange: (tracks: ProjectTrack[]) => void;
  isLoading?: boolean;
  suggestedTracks?: ProjectTrack[];
}

const categoryColors = {
  "product-planning": "bg-purple-500",
  "ui-ux-design": "bg-pink-500",
  "web-development": "bg-blue-500",
  "ios-development": "bg-gray-500",
  "android-development": "bg-green-500",
  "backend-development": "bg-orange-500",
  "api-development": "bg-yellow-500",
  "database-development": "bg-indigo-500",
  "devops-deployment": "bg-cyan-500",
  "qa-testing": "bg-red-500",
  "integration-testing": "bg-teal-500",
  "security-testing": "bg-rose-500",
};

const categoryIcons = {
  "product-planning": FileText,
  "ui-ux-design": Palette,
  "web-development": Globe,
  "ios-development": Smartphone,
  "android-development": Smartphone,
  "backend-development": Server,
  "api-development": Link,
  "database-development": Database,
  "devops-deployment": Settings,
  "qa-testing": TestTube,
  "integration-testing": Zap,
  "security-testing": Shield,
};

// Group categories into main sections
const categoryGroups = {
  Planning: ["product-planning"],
  Design: ["ui-ux-design"],
  Development: [
    "web-development",
    "ios-development",
    "android-development",
    "backend-development",
    "api-development",
    "database-development",
  ],
  Operations: ["devops-deployment"],
  Testing: ["qa-testing", "integration-testing", "security-testing"],
};

const groupColors = {
  Planning: "bg-purple-500",
  Design: "bg-pink-500",
  Development: "bg-blue-500",
  Operations: "bg-cyan-500",
  Testing: "bg-red-500",
};

const groupIcons = {
  Planning: FileText,
  Design: Palette,
  Development: Server,
  Operations: Settings,
  Testing: TestTube,
};

interface TrackGroup {
  name: string;
  tracks: ProjectTrack[];
  startWeek: number;
  endWeek: number;
  totalDuration: number;
  color: string;
  icon: any;
}

function SimpleTimeline({ tracks }: { tracks: ProjectTrack[] }) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const maxWeek = Math.max(...tracks.map((t) => t.endWeek));

  const getTrackColor = (category: string) => {
    return (
      categoryColors[category as keyof typeof categoryColors] || "bg-gray-500"
    );
  };

  const getTrackIcon = (category: string) => {
    return categoryIcons[category as keyof typeof categoryIcons] || FileText;
  };

  // Group tracks by category groups
  const groupedTracks: TrackGroup[] = Object.entries(categoryGroups)
    .map(([groupName, categories]) => {
      const groupTracks = tracks.filter((track) =>
        categories.includes(track.category)
      );

      if (groupTracks.length === 0) return null;

      const startWeek = Math.min(...groupTracks.map((t) => t.startWeek));
      const endWeek = Math.max(...groupTracks.map((t) => t.endWeek));
      const totalDuration = endWeek - startWeek;

      return {
        name: groupName,
        tracks: groupTracks,
        startWeek,
        endWeek,
        totalDuration,
        color: groupColors[groupName as keyof typeof groupColors],
        icon: groupIcons[groupName as keyof typeof groupIcons],
      };
    })
    .filter(Boolean) as TrackGroup[];

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-400 font-medium">Week 0</span>
        <span className="text-sm text-gray-400 font-medium">
          Week {maxWeek}
        </span>
      </div>

      {groupedTracks.map((group, groupIndex) => {
        const Icon = group.icon;
        const isExpanded = expandedGroups.has(group.name);

        return (
          <motion.div
            key={group.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
            className="space-y-2"
          >
            {/* Group Header */}
            <div
              className="cursor-pointer"
              onClick={() => toggleGroup(group.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0",
                      group.color
                        .replace("bg-", "bg-")
                        .replace("-500", "-500/20")
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-3 h-3",
                        group.color.replace("bg-", "text-")
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">
                        {group.name}
                      </h4>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      </motion.div>
                      {group.tracks.length > 1 && (
                        <span className="text-xs text-gray-500 bg-zinc-700/50 px-1.5 py-0.5 rounded">
                          {group.tracks.length} platforms
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {group.tracks
                        .map((t) => t.platform)
                        .filter(Boolean)
                        .join(", ") ||
                        group.tracks.map((t) => t.name).join(", ")}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="text-sm font-medium text-white">
                    {group.totalDuration}w
                  </span>
                  {group.tracks.some((t) => t.canParallelize) && (
                    <div className="flex items-center gap-1">
                      <Users className="w-2 h-2 text-green-400" />
                      <span className="text-xs text-green-400">Parallel</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Group Timeline Bar */}
              <div className="relative h-8 bg-zinc-800/50 rounded-lg overflow-hidden border border-zinc-700/30 mt-2">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: groupIndex * 0.1 + 0.2, duration: 0.4 }}
                  className={cn(
                    "absolute top-0 h-full rounded-lg transition-all duration-300",
                    group.color,
                    "shadow-sm"
                  )}
                  style={{
                    left: `${(group.startWeek / maxWeek) * 100}%`,
                    width: `${(group.totalDuration / maxWeek) * 100}%`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-lg" />
                </motion.div>

                <div className="absolute inset-0 flex items-center justify-between px-2">
                  <span className="text-xs font-medium text-white/90">
                    W{group.startWeek}
                  </span>
                  <span className="text-xs font-medium text-white/90">
                    W{group.endWeek}
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded Track Details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-8 space-y-2 overflow-hidden"
                >
                  {group.tracks.map((track, trackIndex) => {
                    const TrackIcon = getTrackIcon(track.category);

                    return (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: trackIndex * 0.05 }}
                        className="space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="min-w-0 flex justify-start gap-3">
                              <h5 className="text-xs font-medium text-white truncate">
                                {track.name}
                              </h5>
                              {track.platform && (
                                <p className="text-xs text-gray-500 truncate">
                                  {track.platform}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <span className="text-xs font-medium text-white">
                              {track.durationInWeeks}w
                            </span>
                          </div>
                        </div>

                        {/* Individual Track Timeline */}
                        <div className="relative h-[10px] bg-zinc-800/30 rounded overflow-hidden border border-zinc-700/20">
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{
                              delay: trackIndex * 0.05 + 0.1,
                              duration: 0.3,
                            }}
                            className={cn(
                              "absolute top-0 h-[9px] rounded transition-all duration-300",
                              getTrackColor(track.category),
                              "opacity-80"
                            )}
                            style={{
                              left: `${(track.startWeek / maxWeek) * 100}%`,
                              width: `${
                                (track.durationInWeeks / maxWeek) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Compact Timeline ruler */}
      <div className="relative h-6 mt-4">
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-zinc-600" />
        {Array.from({ length: maxWeek + 1 }, (_, i) => i).map((week) => (
          <div
            key={week}
            className={cn(
              "absolute top-0 w-0.5 bg-zinc-500",
              week % 4 === 0 ? "h-6 bg-zinc-400" : "h-4"
            )}
            style={{ left: `${(week / maxWeek) * 100}%` }}
          >
            {(week % 2 === 0 || week === maxWeek) && (
              <span className="absolute top-7 -translate-x-1/2 text-xs text-gray-400 font-medium whitespace-nowrap">
                {week}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProjectTracks({
  onTracksChange,
  isLoading = false,
  suggestedTracks = [],
}: ProjectTracksProps) {
  const [tracks, setTracks] = useState<ProjectTrack[]>([]);
  const hasProcessedSuggestedTracks = useRef(false);

  // Use suggested tracks when available
  useEffect(() => {
    if (suggestedTracks.length > 0 && !hasProcessedSuggestedTracks.current) {
      hasProcessedSuggestedTracks.current = true;
      setTracks(suggestedTracks);
      onTracksChange(suggestedTracks);
    }
  }, [suggestedTracks, onTracksChange]);

  // Reset the flag when suggestedTracks changes
  useEffect(() => {
    hasProcessedSuggestedTracks.current = false;
  }, [suggestedTracks]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-400">Generating project timeline...</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats based on grouped tracks
  const groupedTracks = Object.entries(categoryGroups)
    .map(([groupName, categories]) => {
      const groupTracks = tracks.filter((track) =>
        categories.includes(track.category)
      );
      return groupTracks.length > 0
        ? { name: groupName, tracks: groupTracks }
        : null;
    })
    .filter(Boolean);

  const totalGroups = groupedTracks.length;
  const parallelTracks = tracks.filter((t) => t.canParallelize).length;
  const totalDuration = Math.max(...tracks.map((t) => t.endWeek));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/30"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-xs text-gray-400">Track Groups</p>
              <p className="text-sm font-semibold text-white">{totalGroups}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/30"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-400" />
            <div>
              <p className="text-xs text-gray-400">Parallel</p>
              <p className="text-sm font-semibold text-white">
                {parallelTracks}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/30"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <div>
              <p className="text-xs text-gray-400">Duration</p>
              <p className="text-sm font-semibold text-white">
                {totalDuration}w
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Timeline */}
      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-700/30">
        <SimpleTimeline tracks={tracks} />
      </div>
    </div>
  );
}
