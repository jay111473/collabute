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

const tracksResponseSchema = z.object({
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
    const { projectInfo, competitors, projects } = await request.json();

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

    const model = google("gemini-2.5-pro-preview-03-25");

    const competitorsList =
      competitors?.map((c: any) => c.name).join(", ") ||
      "No competitors provided";
    const projectsList =
      projects
        ?.map((p: any) => `${p.name} (${p.durationInWeeks} weeks)`)
        .join(", ") || "No projects provided";
    const industriesList = projectInfo.industries?.join(", ") || "general";

    const response = await generateObject({
      model,
      schema: tracksResponseSchema,
      prompt: `Analyze this project and create a comprehensive development timeline with platform-specific tracks. This project will be developed in a marketplace where thousands of developers, designers, and product managers can contribute and get paid instantly, so development can be highly parallelized and faster than traditional teams.

Project: ${projectInfo.idea}
Industries: ${industriesList}
Existing Projects: ${projectsList}
Competitors: ${competitorsList}

STEP 1: Platform Analysis
First, analyze what platforms this project needs:
- Web Application (React, Vue, Angular, etc.)
- iOS Mobile App
- Android Mobile App  
- Backend API/Services
- Database Systems
- Admin Dashboard
- Desktop Application
- Chrome Extension
- Other specialized platforms

Consider the project's target audience, use cases, and industry requirements.

STEP 2: Generate Platform-Specific Tracks
Based on the platform analysis, create development tracks for each required platform.

Available track categories:
- ui-ux-design: User interface and experience design
- web-development: Web application development
- ios-development: iOS mobile app development
- android-development: Android mobile app development
- backend-development: Server-side logic and services (API, database, etc.)

For each track, provide:
- id: unique identifier (kebab-case)
- name: descriptive track name including platform
- category: from the enum above
- platform: specific platform name (optional)
- startWeek: when it starts (0-based)
- durationInWeeks: realistic duration for marketplace development
- endWeek: startWeek + durationInWeeks
- dependencies: array of track IDs this depends on
- canParallelize: true if can run parallel with other tracks

STEP 3: Timeline Optimization
Consider these development patterns:
- UI/UX Design can start after initial planning (2-6 weeks)
- Backend/API development can start early and run parallel
- Frontend platforms can develop in parallel after design

Generate a realistic timeline considering:
- Marketplace speed advantages (more developers = faster development)
- Platform complexity and interdependencies  

Aim for 12-24 weeks total duration for most projects.`,
      temperature: 0.7,
      maxTokens: 6000,
    });

    return response.toJsonResponse();
  } catch (error) {
    console.error("Tracks generation error:", error);

    // Enhanced fallback with platform-specific tracks
    const fallbackResponse = {
      platformAnalysis: {
        requiredPlatforms: [
          {
            platform: "Web Application",
            priority: "high",
            reasoning: "Essential for broad accessibility and user engagement",
          },
          {
            platform: "Backend API",
            priority: "high",
            reasoning: "Required for data management and business logic",
          },
          {
            platform: "Mobile Apps",
            priority: "medium",
            reasoning: "Important for mobile user experience",
          },
        ],
        estimatedComplexity: "moderate",
        recommendedApproach:
          "Start with web and backend, then expand to mobile platforms",
      },
      tracks: [
        {
          id: "product-planning",
          name: "Product Planning & Requirements",
          category: "product-planning",
          startWeek: 0,
          durationInWeeks: 3,
          endWeek: 3,
          dependencies: [],
          canParallelize: false,
        },
        {
          id: "ui-ux-design",
          name: "UI/UX Design System",
          category: "ui-ux-design",
          startWeek: 1,
          durationInWeeks: 4,
          endWeek: 5,
          dependencies: ["product-planning"],
          canParallelize: false,
        },
        {
          id: "backend-development",
          name: "Backend Development",
          category: "backend-development",
          platform: "Backend API",
          startWeek: 3,
          durationInWeeks: 6,
          endWeek: 9,
          dependencies: ["product-planning"],
          canParallelize: true,
        },
        {
          id: "database-development",
          name: "Database Development",
          category: "database-development",
          platform: "Database",
          startWeek: 3,
          durationInWeeks: 3,
          endWeek: 6,
          dependencies: ["product-planning"],
          canParallelize: true,
        },
        {
          id: "web-development",
          name: "Web Development",
          category: "web-development",
          platform: "Web Application",
          startWeek: 4,
          durationInWeeks: 5,
          endWeek: 9,
          dependencies: ["ui-ux-design"],
          canParallelize: true,
        },
        {
          id: "ios-development",
          name: "iOS Development",
          category: "ios-development",
          platform: "iOS App",
          startWeek: 5,
          durationInWeeks: 4,
          endWeek: 9,
          dependencies: ["ui-ux-design", "backend-development"],
          canParallelize: true,
        },
        {
          id: "android-development",
          name: "Android Development",
          category: "android-development",
          platform: "Android App",
          startWeek: 5,
          durationInWeeks: 4,
          endWeek: 9,
          dependencies: ["ui-ux-design", "backend-development"],
          canParallelize: true,
        },
        {
          id: "qa-testing",
          name: "QA and Testing",
          category: "qa-testing",
          startWeek: 8,
          durationInWeeks: 3,
          endWeek: 11,
          dependencies: [
            "web-development",
            "ios-development",
            "android-development",
          ],
          canParallelize: false,
        },
      ],
      totalEstimatedDuration: 11,
      criticalPath: [
        "product-planning",
        "ui-ux-design",
        "backend-development",
        "web-development",
        "qa-testing",
      ],
      parallelizationOpportunities: [
        {
          trackIds: ["backend-development", "database-development"],
          description: "Backend and database can be developed simultaneously",
        },
        {
          trackIds: [
            "web-development",
            "ios-development",
            "android-development",
          ],
          description:
            "All frontend platforms can be developed in parallel after design completion",
        },
      ],
    };

    return Response.json(fallbackResponse, { status: 200 });
  }
}
