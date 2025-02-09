import { generateObject } from "ai";
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { NextResponse } from "next/server";
import { Competitor } from "@/types/wizard";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

interface ProjectPlatformInput {
  value: string;
  isCore?: boolean;
}
const platformEnum = z.enum([
  "frontend",
  "backend",
  "ios",
  "android",
  "windows",
  "macos",
  "cross-platform-mobile",
  "cross-platform-desktop",
  "ai",
  "fullstack",
]);

export async function POST(request: Request) {
  try {
    const requestData = await request.json();

    const {
      projectName,
      description,
      industries,
      competitors,
      projectPlatforms,
      projectScope,
    } = requestData;

    // Validate required fields
    if (
      !projectName ||
      !description ||
      !industries ||
      !competitors ||
      !projectPlatforms ||
      !projectScope
    ) {
      console.error("Missing required fields:", {
        hasProjectName: !!projectName,
        hasDescription: !!description,
        hasIndustries: !!industries,
        hasCompetitors: !!competitors,
        hasProjectPlatforms: !!projectPlatforms,
        hasProjectScope: !!projectScope,
      });
      return NextResponse.json(
        {
          error: "Missing required fields",
          missingFields: {
            projectName: !projectName,
            description: !description,
            industries: !industries,
            competitors: !competitors,
            projectPlatforms: !projectPlatforms,
            projectScope: !projectScope,
          },
        },
        { status: 400 }
      );
    }

    // Create the schema with dynamic project sides
    const featureSchema = z.object({
      features: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          estimatedTimeline: z.string(),
          phase: z.enum(["alpha", "beta", "production"]),
          complexity: z.enum(["simple", "medium", "complex"]),
          platform: platformEnum,
          projectSide: z.enum([
            "frontend",
            "backend",
            "ios",
            "android",
            "ai",
            "devops",
            "windows",
            "macos",
            "linux",
            "cross-platform",
          ]),
        })
      ),
    });

    const prompt = `You are a senior full-stack developer. Generate detailed features for a ${projectPlatforms
      .map((p: ProjectPlatformInput) => p.value)
      .join(", ")} project.

Project Context:
Name: ${projectName}
Description: ${description}
Industries: ${industries.join(", ")}
Competitors: ${competitors.map((c: Competitor) => c.name).join(", ")}
Platforms: ${projectPlatforms
      .map((p: ProjectPlatformInput) => p.value)
      .join(", ")}
Scope: ${projectScope}

For each platform and phase (alpha, beta, production) generate at least 10 features.

make sure to understand that when you are providing fullstack features their implementation should be divided between frontend and backend, 
go with best practices and make sure you are providing features that are small enough to be managable as a task for a single developer.

For each feature, provide:
1. Clear, descriptive title
2. Detailed description of functionality
3. Estimated timeline
4. Complexity level

Remember:
- NEVER use "fullstack" as a projectSide
- Split fullstack features into separate frontend and backend features
- Always use the exact values specified above for projectSide, platform, complexity, and phase
`;

    try {
      const data = await generateObject({
        model: anthropic("claude-3-5-sonnet-20241022"),
        prompt,
        schema: featureSchema,
        system: `You are a senior full-stack developer with extensive experience in ${projectPlatforms
          .map((p: ProjectPlatformInput) => p.value)
          .join(", ")} development.
Generate detailed features that are clear and actionable.
Focus on functionality and business value rather than technical implementation.
Your responses must be valid JSON objects only, following the exact schema provided.
Provide at least 10 features for each platform and phase.
for IOS or Android features, make sure you provide a detail feature list just like how you provide it for web frontend
dont skip a feature for mobile applications or web if you already provided it for other platforms This is an important rule
NEVER use "fullstack" as a projectSide - split fullstack features into frontend and backend parts.
`,
        temperature: 1,
      });

      console.log("Successfully generated features:", {
        featureCount: data.object.features?.length || 0,
      });

      return NextResponse.json(data.object);
    } catch (error) {
      console.error("Error in AI generation:", error);
      return NextResponse.json(
        {
          error: "AI generation failed",
          details: error instanceof Error ? error.message : "Unknown error",
          features: [],
        },
        {
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error("Error in main request handler:", error);
    return NextResponse.json(
      {
        error: "Request processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
        features: [],
      },
      {
        status: 500,
      }
    );
  }
}
