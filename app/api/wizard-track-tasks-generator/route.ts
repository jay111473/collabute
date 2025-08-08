import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";

// Zod schemas for validation
const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  estimatedDays: z.number(),
  priority: z.enum(["high", "medium", "low"]),
  skillLevel: z.enum(["junior", "mid", "senior"]),
});

const trackTasksSchema = z.object({
  trackId: z.string(),
  trackName: z.string(),
  trackCategory: z.string(),
  platform: z.string().optional(),
  tasks: z.array(taskSchema).length(3), // Enforce exactly 3 preview tasks
  totalEstimatedDays: z.number(), // Total days for complete platform
  totalTasksCount: z.number(), // Total tasks count for complete platform
  criticalTasks: z.array(z.string()),
  parallelTaskGroups: z.array(
    z.object({
      taskIds: z.array(z.string()),
      description: z.string(),
    })
  ),
  requiredSkills: z.array(z.string()),
});

const allTracksTasksSchema = z.object({
  trackTasks: z.array(trackTasksSchema),
});

export async function POST(request: NextRequest) {
  try {
    const {
      projectInfo,
      tracks,
      competitors,
      businessComparison,
      projectContext,
    } = await request.json();

    if (
      !projectInfo ||
      !tracks ||
      !Array.isArray(tracks) ||
      tracks.length === 0
    ) {
      return Response.json(
        {
          error: "Missing required fields",
          missingFields: {
            projectInfo: !projectInfo,
            tracks: !tracks || !Array.isArray(tracks) || tracks.length === 0,
          },
        },
        { status: 400 }
      );
    }

    // Use faster model for better performance
    const model = google("gemini-2.5-flash");

    // Build comprehensive context including timeline information
    const projectContextString = `Project: ${projectInfo.idea}
Industries: ${projectInfo.industries?.join(", ") || "general"}
Competitors: ${competitors?.map((c: any) => c.name).join(", ") || "none"}`;

    // Build detailed tracks timeline context
    const tracksTimeline = tracks
      .map((track) => {
        const dependencies =
          track.dependencies?.length > 0
            ? ` | Depends on: ${track.dependencies.join(", ")}`
            : "";
        const parallelizable = track.canParallelize
          ? " | Can run in parallel"
          : "";

        return `${track.name} (${track.category}):
  - Timeline: Week ${track.startWeek}-${track.endWeek} (${
          track.durationInWeeks
        }w)
  - Platform: ${track.platform || "General"}${dependencies}${parallelizable}`;
      })
      .join("\n");

    // Build project timeline overview
    const totalProjectWeeks = Math.max(...tracks.map((t) => t.endWeek));
    const timelineOverview = `Total Project Duration: ${totalProjectWeeks} weeks
Tracks running in parallel: ${
      tracks
        .filter((t) => t.canParallelize)
        .map((t) => t.name)
        .join(", ") || "None"
    }`;

    console.log(`🚀 Generating 3 tasks for ${tracks.length} tracks...`);

    // Generate tasks for all tracks at once with optimized prompt
    const allTrackTasks = await generateObject({
      model,
      schema: allTracksTasksSchema,
      temperature: 0.3, // Lower temperature for more consistent results
      maxTokens: 8000, // Increased token limit to prevent truncation
      prompt: `Generate task preview and complete platform estimates for each track.

${projectContextString}

PROJECT TIMELINE:
${timelineOverview}

TRACK DETAILS:
${tracksTimeline}

REQUIREMENTS:
1. PREVIEW TASKS (exactly 3 per track):
   - These are just preview/sample tasks to show the user
   - Generate 3 representative tasks that showcase the work involved
   - Each task should have estimatedDays (not hours)
   - Tasks: Setup/Architecture, Core Implementation, Integration/Testing
   - 1-5 days per preview task

2. COMPLETE PLATFORM ESTIMATES:
   - totalEstimatedDays: Total days needed to complete the ENTIRE platform/track (not just the 3 preview tasks)
   - totalTasksCount: Total number of tasks for the COMPLETE platform (e.g., 15-50 tasks typically)
   - Consider the full scope of work including all features, testing, documentation, deployment

3. FORMAT:
   - Professional task names (max 50 chars)
   - Priority: high/medium/low
   - Skill level: junior/mid/senior
   - Estimates in DAYS not hours

Tracks to process:
${tracks
  .map(
    (track) => `
${track.id}: ${track.name} (${track.category})
- Platform: ${track.platform || "General"}
- Timeline: Week ${track.startWeek}-${track.endWeek} (${track.durationInWeeks}w)
- Available Days: ${track.durationInWeeks * 5} working days
- Dependencies: ${track.dependencies?.join(", ") || "None"}
- Can Parallelize: ${track.canParallelize ? "Yes" : "No"}`
  )
  .join("\n")}

Remember: The 3 tasks are just previews. totalEstimatedDays and totalTasksCount should reflect the COMPLETE platform development.`,
    });

    // Create a map of generated tasks
    const generatedTasksMap = new Map();
    allTrackTasks.object.trackTasks.forEach((trackTask) => {
      generatedTasksMap.set(trackTask.trackId, trackTask);
    });

    // Ensure all tracks have tasks, generate defaults if missing
    const result = tracks.map((originalTrack) => {
      const trackTask = generatedTasksMap.get(originalTrack.id);
      
      // If no tasks were generated for this track, create default tasks
      if (!trackTask || !trackTask.tasks || trackTask.tasks.length === 0) {
        console.warn(`⚠️ No tasks generated for ${originalTrack.name}, creating defaults`);
        
        const defaultTasks = [
          {
            id: `${originalTrack.id}-task-1`,
            name: `${originalTrack.name} Architecture & Setup`,
            estimatedDays: Math.min(3, originalTrack.durationInWeeks),
            priority: "high" as const,
            skillLevel: "senior" as const,
          },
          {
            id: `${originalTrack.id}-task-2`,
            name: `Core ${originalTrack.name} Implementation`,
            estimatedDays: Math.min(5, originalTrack.durationInWeeks * 2),
            priority: "high" as const,
            skillLevel: "mid" as const,
          },
          {
            id: `${originalTrack.id}-task-3`,
            name: `${originalTrack.name} Testing & Integration`,
            estimatedDays: Math.min(2, originalTrack.durationInWeeks),
            priority: "medium" as const,
            skillLevel: "mid" as const,
          },
        ];

        const totalDays = originalTrack.durationInWeeks * 5; // 5 working days per week
        const totalTasksCount = Math.max(15, originalTrack.durationInWeeks * 3); // Estimate 3 tasks per week minimum

        return {
          trackId: originalTrack.id,
          trackName: originalTrack.name,
          trackCategory: originalTrack.category,
          platform: originalTrack.platform,
          startWeek: originalTrack.startWeek,
          endWeek: originalTrack.endWeek,
          durationInWeeks: originalTrack.durationInWeeks,
          dependencies: originalTrack.dependencies || [],
          canParallelize: originalTrack.canParallelize || false,
          tasks: defaultTasks,
          totalEstimatedDays: totalDays,
          totalTasksCount: totalTasksCount,
          criticalTasks: [defaultTasks[0].id, defaultTasks[1].id],
          parallelTaskGroups: [],
          requiredSkills: [],
        };
      }

      // Ensure exactly 3 tasks
      const limitedTasks = trackTask.tasks.slice(0, 3);
      
      // If less than 3 tasks, add default tasks
      while (limitedTasks.length < 3) {
        const taskNum = limitedTasks.length + 1;
        limitedTasks.push({
          id: `${originalTrack.id}-task-${taskNum}`,
          name: `${originalTrack.name} Task ${taskNum}`,
          estimatedDays: Math.min(2, originalTrack.durationInWeeks),
          priority: taskNum === 1 ? "high" : "medium" as const,
          skillLevel: "mid" as const,
        });
      }

      // Ensure we have complete platform estimates
      const totalEstimatedDays = trackTask.totalEstimatedDays || originalTrack.durationInWeeks * 5;
      const totalTasksCount = trackTask.totalTasksCount || Math.max(15, originalTrack.durationInWeeks * 3);

      return {
        ...trackTask,
        trackId: originalTrack.id,
        trackName: originalTrack.name,
        trackCategory: originalTrack.category,
        platform: originalTrack.platform,
        startWeek: originalTrack.startWeek,
        endWeek: originalTrack.endWeek,
        durationInWeeks: originalTrack.durationInWeeks,
        dependencies: originalTrack.dependencies || [],
        canParallelize: originalTrack.canParallelize || false,
        tasks: limitedTasks,
        totalEstimatedDays: totalEstimatedDays,
        totalTasksCount: totalTasksCount,
        criticalTasks: trackTask.criticalTasks || [],
        parallelTaskGroups: trackTask.parallelTaskGroups || [],
        requiredSkills: trackTask.requiredSkills || [],
      };
    });

    console.log(
      `✅ Generated ${result.length} tracks with ${result.reduce(
        (sum, track) => sum + track.tasks.length,
        0
      )} total tasks`
    );

    return Response.json({ trackTasks: result });
  } catch (error) {
    console.error("Track tasks generation error:", error);

    // Check if it's a JSON parsing error
    if (error instanceof Error && error.message.includes("JSON")) {
      console.error("JSON parsing failed - likely due to truncated response");
      return Response.json(
        {
          error: "Task generation incomplete",
          details: "Response was truncated. Please try again.",
        },
        { status: 500 }
      );
    }

    return Response.json(
      { error: "Failed to generate track tasks" },
      { status: 500 }
    );
  }
}
