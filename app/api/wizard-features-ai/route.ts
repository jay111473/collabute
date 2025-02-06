import { generateObject } from "ai";
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { NextResponse } from "next/server";
import { ProjectSide } from "@/types/wizard";
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
    const {
      projectName,
      description,
      industries,
      competitors,
      projectPlatforms,
      projectScope,
    } = (await request.json()) as {
      projectName: string;
      description: string;
      industries: string[];
      competitors: { name: string; url: string }[];
      projectPlatforms: ProjectPlatformInput[];
      projectScope: string;
    };

    // Create the schema with dynamic project sides
    const featureSchema = z.object({
      features: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          estimatedPrice: z.string(),
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
      .map((p) => p.value)
      .join(", ")} project.

Project Context:
Name: ${projectName}
Description: ${description}
Industries: ${industries.join(", ")}
Competitors: ${competitors.map((c) => c.name).join(", ")}
Platforms: ${projectPlatforms.map((p) => p.value).join(", ")}
Scope: ${projectScope}

For each platform and phase (alpha, beta, production) generate at least 10 features.

make sure to understand that when you are providing fullstack features their implementation should be divided between frontend and backend, 
go with best practices and make sure you are providing features that are small enough to be managable as a task for a single developer. and big enough to be able to pay for this feature to developer

For each feature, provide:
1. Clear, descriptive title
2. Detailed description of functionality
3. Estimated timeline
4. Estimated price
5. Complexity level

Remember:
- NEVER use "fullstack" as a projectSide
- Split fullstack features into separate frontend and backend features
- Always use the exact values specified above for projectSide, platform, complexity, and phase
`;

    try {
      const data = await generateObject({
        model: bedrock("anthropic.claude-3-5-sonnet-20240620-v1:0"),
        prompt,
        schema: featureSchema,
        system: `You are a senior full-stack developer with extensive experience in ${projectPlatforms
          .map((p) => p.value)
          .join(", ")} development.
Generate detailed features that are clear and actionable.
Focus on functionality and business value rather than technical implementation.
Your responses must be valid JSON objects only, following the exact schema provided.
Provide at least 10 features for each platform and phase.
NEVER use "fullstack" as a projectSide - split fullstack features into frontend and backend parts.
`,
        temperature: 0.7,
        maxTokens: 4000,
      });


      return NextResponse.json(data.object);
    } catch (error) {
      return NextResponse.json(
        {
          features: [],
        },
        {
          status: 500,
        }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        features: [],
      },
      {
        status: 500,
      }
    );
  }
}
