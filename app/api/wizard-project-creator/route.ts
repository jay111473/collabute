import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";

const projectPhaseSchema = z.object({
  name: z.string(),
  durationInWeeks: z.number(),
  description: z.string(),
});

const generatedProjectSchema = z.object({
  id: z.string(), // Unique identifier for dependency tracking
  name: z.string(),
  platform: z.string(),
  framework: z.string(),
  language: z.string(),
  estimatedTimeline: z.string(), // Keep for backward compatibility
  durationInWeeks: z.number(), // Precise duration for Gantt chart
  priority: z.enum(["high", "medium", "low"]),
  dependencies: z.array(z.string()), // Array of project IDs that must be completed first
  resourceRequirements: z.object({
    teamSize: z.number(),
    skillLevel: z.enum(["junior", "mid", "senior"]),
    specializations: z.array(z.string()),
  }),
  phases: z.array(projectPhaseSchema),
  deliverables: z.array(z.string()),
});

const projectsResponseSchema = z.object({
  projects: z.array(generatedProjectSchema),
  totalEstimatedDuration: z.number(), // Total weeks if done sequentially
  criticalPath: z.array(z.string()), // Project IDs in critical path
  parallelizationOpportunities: z.array(
    z.object({
      projectIds: z.array(z.string()),
      description: z.string(),
    })
  ),
});

export async function POST(request: NextRequest) {
  const { name, description, projectPlatforms, industries } =
    await request.json();
  console.log(name, description, projectPlatforms, industries);

  if (
    !name ||
    !description ||
    !projectPlatforms ||
    projectPlatforms.length === 0
  ) {
    return Response.json(
      {
        error: "Missing required fields",
        missingFields: { name, description, projectPlatforms },
      },
      { status: 400 }
    );
  }

  const model = google("gemini-2.5-flash");

  const platformsList = projectPlatforms.map((p: any) => p.value).join(", ");
  const industriesList = industries?.join(", ") || "general";

  const response = await generateObject({
    model,
    schema: projectsResponseSchema,
    prompt: `You are a Technical Product Manager at a software development marketplace. Break down this project into separate development projects with detailed Gantt chart planning.

Project Details:
- Name: ${name}
- Description: ${description}
- Target Platforms: ${platformsList}
- Industries: ${industriesList}

Create a comprehensive project breakdown with Gantt chart properties:

For each project, provide:
1. **id**: Unique identifier (e.g., "frontend-app", "backend-api", "mobile-ios")
2. **name**: Clear project name (e.g., "E-commerce Frontend", "User Management API")
3. **platform**: Project type (e.g., "Frontend Application", "Backend API", "iOS App")
4. **framework**: Technology stack (e.g., "React", "Node.js", "Swift", "Flutter")
5. **language**: Programming language (e.g., "TypeScript", "JavaScript", "Swift")
6. **estimatedTimeline**: Human-readable timeline (e.g., "2-3 weeks")
7. **durationInWeeks**: Precise numeric duration for Gantt chart (e.g., 3, 5, 8)
8. **priority**: "high", "medium", or "low" based on business impact
9. **dependencies**: Array of project IDs that must complete first (e.g., ["backend-api"] for frontend)
10. **resourceRequirements**: 
    - teamSize: Number of developers needed (1-4)
    - skillLevel: "junior", "mid", or "senior"
    - specializations: Required skills (e.g., ["React", "TypeScript", "UI/UX"])
11. **phases**: Break project into 2-4 phases with duration and description
12. **description**: Detailed project scope and objectives
13. **deliverables**: Key outputs (e.g., ["Responsive web app", "API documentation"])

Also provide:
- **totalEstimatedDuration**: Total weeks if all projects done sequentially
- **criticalPath**: Array of project IDs that determine minimum timeline
- **parallelizationOpportunities**: Groups of projects that can run simultaneously

Dependency Rules:
- Backend APIs should typically come before frontends
- Core infrastructure before feature development
- Authentication/user management before user-facing features
- Database design before API development

Priority Guidelines:
- High: Core functionality, user authentication, payment systems
- Medium: Feature enhancements, admin panels, analytics
- Low: Nice-to-have features, advanced integrations

Generate 3-6 projects maximum. Focus on realistic timelines for paid open-source development.`,
  });

  return response.toJsonResponse();
}
