import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";

// Zod schemas for validation
const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  estimatedHours: z.number(),
  priority: z.enum(["high", "medium", "low"]),
  skillLevel: z.enum(["junior", "mid", "senior"]),
});

const trackTasksSchema = z.object({
  trackId: z.string(),
  trackName: z.string(),
  trackCategory: z.string(),
  platform: z.string().optional(),
  tasks: z.array(taskSchema).length(3), // Enforce exactly 3 tasks
  totalEstimatedHours: z.number(),
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
    const model = google("gemini-2.5-flash-preview-04-17");

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
      prompt: `Generate EXACTLY 3 essential tasks for each track. Keep responses concise.

${projectContextString}

PROJECT TIMELINE:
${timelineOverview}

TRACK DETAILS:
${tracksTimeline}

REQUIREMENTS:
- Generate EXACTLY 3 tasks per track
- Respect timeline and dependencies
- Tasks: Setup (high), Core (high/medium), Integration (medium)
- 8-24 hours per task, fit within track duration
- Professional names (max 50 chars)
- Only provide: id, name, estimatedHours, priority, skillLevel

Tracks to process:
${tracks
  .map(
    (track) => `
${track.id}: ${track.name} (${track.category})
- Platform: ${track.platform || "General"}
- Timeline: Week ${track.startWeek}-${track.endWeek} (${track.durationInWeeks}w)
- Max Hours: ${track.durationInWeeks * 40}h
- Dependencies: ${track.dependencies?.join(", ") || "None"}
- Can Parallelize: ${track.canParallelize ? "Yes" : "No"}`
  )
  .join("\n")}

Keep responses concise but professional. Focus on quality over quantity.`,
    });

    // Ensure trackIds match and validate results
    const result = allTrackTasks.object.trackTasks.map((trackTask) => {
      const originalTrack = tracks.find((t) => t.id === trackTask.trackId);

      // Ensure exactly 3 tasks
      const limitedTasks = trackTask.tasks.slice(0, 3);

      // Validate timeline constraints
      const maxHoursForTrack = (originalTrack?.durationInWeeks || 1) * 40;
      const totalTaskHours = limitedTasks.reduce(
        (sum, task) => sum + task.estimatedHours,
        0
      );

      // Log warning if tasks exceed track duration
      if (totalTaskHours > maxHoursForTrack) {
        console.warn(
          `⚠️ Track ${trackTask.trackName}: ${totalTaskHours}h exceeds ${maxHoursForTrack}h limit`
        );
      }

      return {
        ...trackTask,
        trackId: originalTrack?.id || trackTask.trackId,
        trackName: originalTrack?.name || trackTask.trackName,
        trackCategory: originalTrack?.category || trackTask.trackCategory,
        platform: originalTrack?.platform || trackTask.platform,
        startWeek: originalTrack?.startWeek,
        endWeek: originalTrack?.endWeek,
        durationInWeeks: originalTrack?.durationInWeeks,
        dependencies: originalTrack?.dependencies || [],
        canParallelize: originalTrack?.canParallelize || false,
        tasks: limitedTasks,
        totalEstimatedHours: totalTaskHours,
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
