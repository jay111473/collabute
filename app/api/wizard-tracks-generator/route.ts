import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";

const projectTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum([
    "ui-ux-design",
    "web-development",
    "ios-development",
    "android-development",
    "backend-development",
  ]),
  platform: z.string().optional(), // e.g., "iOS", "Android", "Web", "Backend"
  startWeek: z.number(),
  durationInWeeks: z.number(),
  endWeek: z.number(),
  dependencies: z.array(z.string()).optional(), // Track IDs this depends on
  canParallelize: z.boolean().optional(), // Can run in parallel with other tracks
});

const projectPlanSchema = z.object({
  platformAnalysis: z.object({
    requiredPlatforms: z.array(z.string()),
    estimatedComplexity: z.enum(["simple", "moderate", "complex"]),
    recommendedApproach: z.string(),
  }),
  tracks: z.array(projectTrackSchema),
  totalEstimatedDuration: z.number(),
  parallelizationOpportunities: z.array(
    z.object({
      trackIds: z.array(z.string()),
      description: z.string(),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const { projectInfo, competitors } = await request.json();

    if (!projectInfo || !projectInfo.idea) {
      return Response.json(
        {
          error: "Missing required fields",
          missingFields: {
            projectInfo: !projectInfo,
            idea: !projectInfo?.idea,
          },
        },
        { status: 400 }
      );
    }

    const model = google("gemini-2.5-pro");
    const competitorsList =
      competitors?.map((c: any) => c.name).join(", ") || "None";
    const industriesList = projectInfo.industries?.join(", ") || "general";

    console.log("🚀 Generating complete project plan...");

    const result = await generateObject({
      model,
      schema: projectPlanSchema,
      temperature: 0.4,
      maxTokens: 8000,
      prompt: `Project: ${projectInfo.idea}
Industries: ${industriesList}
Competitors: ${competitorsList}

Create a complete development plan with proper dependencies:

PLATFORMS TO CONSIDER:
- UI/UX Design (always required)
- Backend Development (APIs, databases)
- Web Application 
- iOS Mobile App
- Android Mobile App

TRACK REQUIREMENTS:
1. Each platform = 1 track only
2. Realistic durations (3-6 weeks per track)
3. Proper dependencies (UI/UX first, then backend, then frontend platforms)
4. Kebab-case IDs (e.g., "ui-ux-design", "backend-api", "web-app")
5. StartWeek and endWeek based on dependencies
6. Mark tracks that can run in parallel

DEPENDENCY RULES:
- UI/UX Design: No dependencies (starts week 1)
- Backend: Depends on UI/UX completion
- Web/iOS/Android: Depend on both UI/UX and Backend
- Mobile apps can run parallel to each other

OUTPUT FORMAT:
- platformAnalysis: Required platforms and complexity
- tracks: Complete tracks with proper timing
- totalEstimatedDuration: Total project weeks
- parallelizationOpportunities: Which tracks can run together`,
    });

    return Response.json(result.object, { status: 200 });
  } catch (error) {
    console.error("Tracks generation error:", error);
    return Response.json(
      { error: "Failed to generate tracks" },
      { status: 500 }
    );
  }
}
