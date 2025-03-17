"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitHubStats } from "@/types/github";
import { useState } from "react";

interface GitHubHeatmapProps {
  stats?: GitHubStats;
  isLoading?: boolean;
}

/**
 * Component to display GitHub activity heatmap
 */
export function GitHubHeatmap({ stats, isLoading = false }: GitHubHeatmapProps) {
  const months = ["Jul", "Sep", "Nov", "Dec"];
  
  // Generate random activity data for the heatmap
  // In a real implementation, this would come from the GitHub API
  const generateActivityData = () => {
    const activityLevels = [0, 1, 2, 3, 4]; // 0: no activity, 1-4: activity levels
    const rows = 7; // 7 days in a week
    const cols = 20; // 20 weeks shown
    
    const data = Array(rows).fill(0).map(() => 
      Array(cols).fill(0).map(() => {
        // Higher probability of low or no activity
        const rand = Math.random();
        if (rand < 0.5) return 0; // 50% chance of no activity
        if (rand < 0.7) return 1; // 20% chance of level 1
        if (rand < 0.85) return 2; // 15% chance of level 2
        if (rand < 0.95) return 3; // 10% chance of level 3
        return 4; // 5% chance of level 4
      })
    );
    
    return data;
  };
  
  const [activityData] = useState(() => generateActivityData());
  
  // Get color based on activity level
  const getActivityColor = (level: number) => {
    switch (level) {
      case 0: return "bg-gray-800";
      case 1: return "bg-purple-900";
      case 2: return "bg-purple-700";
      case 3: return "bg-purple-500";
      case 4: return "bg-purple-300";
      default: return "bg-gray-800";
    }
  };
  
  if (isLoading) {
    return (
      <Card className="bg-[#1e2736] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="flex justify-between mb-4">
              {months.map((_, i) => (
                <div key={i} className="h-4 bg-gray-700 rounded w-12" />
              ))}
            </div>
            <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1">
              {Array.from({ length: 140 }).map((_, i) => (
                <div key={i} className="h-3 w-3 bg-gray-700 rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-[#1e2736] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white text-lg">Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <div className="flex justify-between mb-4">
            {months.map((month) => (
              <div key={month} className="text-xs text-gray-400">
                {month}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1">
            {activityData.flat().map((level, i) => (
              <div 
                key={i} 
                className={`h-3 w-3 rounded-sm ${getActivityColor(level)}`}
                title={`${level} contributions`}
              />
            ))}
          </div>
          
          <div className="flex items-center justify-end mt-4 text-xs text-gray-400">
            <span className="mr-2">Your recent activity on callabute</span>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-sm bg-gray-800" />
              <div className="h-2 w-2 rounded-sm bg-purple-900" />
              <div className="h-2 w-2 rounded-sm bg-purple-700" />
              <div className="h-2 w-2 rounded-sm bg-purple-500" />
              <div className="h-2 w-2 rounded-sm bg-purple-300" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 