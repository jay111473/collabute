import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";

// Zod schemas for validation
const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  estimatedHours: z.number(),
  priority: z.enum(["high", "medium", "low"]),
  skillLevel: z.enum(["junior", "mid", "senior"]),
  dependencies: z.array(z.string()),
  deliverables: z.array(z.string()),
  acceptanceCriteria: z.array(z.string()),
  tags: z.array(z.string()),
});

const trackTasksSchema = z.object({
  trackId: z.string(),
  trackName: z.string(),
  trackCategory: z.string(),
  platform: z.string().optional(),
  tasks: z.array(taskSchema),
  totalEstimatedHours: z.number(),
  criticalTasks: z.array(z.string()),
  parallelTaskGroups: z.array(z.object({
    taskIds: z.array(z.string()),
    description: z.string(),
  })),
  requiredSkills: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const { 
      projectInfo, 
      track, 
      competitors, 
      businessComparison, 
      projectContext,
      previousTracks 
    } = await request.json();

    if (!projectInfo || !track) {
      return Response.json(
        {
          error: "Missing required fields",
          missingFields: {
            projectInfo: !projectInfo,
            track: !track,
          },
        },
        { status: 400 }
      );
    }

    const model = google("gemini-2.5-flash-preview-04-17");

    // Build context from project and previous tracks
    let cumulativeContext = `Project Context:
- Idea: ${projectInfo.idea}
- Industries: ${projectInfo.industries?.join(", ") || "general"}
- Competitors: ${competitors?.map((c: any) => c.name).join(", ") || "none"}`;

    if (projectContext) {
      cumulativeContext += `
- Complexity: ${projectContext.projectComplexity}
- Target Audience: ${projectContext.targetAudience}
- Business Goals: ${projectContext.keyBusinessGoals?.join(", ") || ""}
- Quality Standards: ${JSON.stringify(projectContext.qualityStandards || {})}
- Guidelines: ${projectContext.developmentGuidelines?.join("; ") || ""}`;
    }

    if (previousTracks && previousTracks.length > 0) {
      cumulativeContext += `\n\nPreviously Generated Tracks:`;
      previousTracks.forEach((prevTrack: any) => {
        cumulativeContext += `\n- ${prevTrack.trackName}: ${prevTrack.tasks?.length || 0} tasks, ${prevTrack.totalEstimatedHours || 0} hours, skills: ${prevTrack.requiredSkills?.join(", ") || ""}`;
      });
    }

    // Generate tasks for the single track
    const trackTasks = await generateObject({
      model,
      schema: trackTasksSchema,
      prompt: `As a specialized ${track.category} expert, break down this track into detailed development tasks:

${cumulativeContext}

Current Track Details:
- ID: ${track.id}
- Name: ${track.name}
- Category: ${track.category}
- Platform: ${track.platform || "N/A"}
- Duration: ${track.durationInWeeks} weeks
- Dependencies: ${track.dependencies?.join(", ") || "none"}
- Can Parallelize: ${track.canParallelize || false}

Generate 6-8 specific, actionable tasks for this track. Each task should:

1. **Task Breakdown**: Create granular, developer-ready tasks
2. **Realistic Estimation**: 4-40 hours per task (1-5 days of work)
3. **Clear Dependencies**: Both within-track and cross-track dependencies
4. **Skill Matching**: Appropriate skill level for each task
5. **Quality Focus**: Include testing, documentation, and review tasks
6. **Marketplace Ready**: Tasks that can be picked up by different developers

Task Categories to Consider:
- Setup/Infrastructure tasks
- Core development tasks  
- Integration tasks
- Testing tasks
- Documentation tasks
- Review/QA tasks

For each task provide:
- **id**: unique identifier (kebab-case)
- **name**: clear, action-oriented name
- **description**: detailed scope and requirements
- **estimatedHours**: realistic time estimate
- **priority**: high/medium/low based on business impact
- **skillLevel**: junior/mid/senior based on complexity
- **dependencies**: task IDs this depends on
- **deliverables**: specific outputs expected
- **acceptanceCriteria**: clear success criteria
- **tags**: technology/skill tags for matching

Also provide:
- **totalEstimatedHours**: sum of all task hours
- **criticalTasks**: task IDs that block other work
- **parallelTaskGroups**: tasks that can run simultaneously
- **requiredSkills**: key skills needed for this track

Consider the project complexity and maintain consistency with previously generated tracks.`,
      temperature: 0.4,
    });

    // Ensure the trackId matches the input track
    const result = {
      ...trackTasks.object,
      trackId: track.id,
      trackName: track.name,
      trackCategory: track.category,
      platform: track.platform,
    };

    return Response.json(result);

  } catch (error) {
    console.error("Track tasks generation error:", error);
    return Response.json({ error: "Failed to generate track tasks" }, { status: 500 });
  }
} 