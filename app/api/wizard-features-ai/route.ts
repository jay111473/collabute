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

IMPORTANT RULES:
1. For projectSide, you can ONLY use these exact values:
   - "frontend" - for user interface features
   - "backend" - for server-side features
   - "ios" - for iOS-specific features
   - "android" - for Android-specific features
   - "ai" - for AI/ML features
   - "devops" - for DevOps features
   - "windows" - for Windows-specific features
   - "macos" - for macOS-specific features
   - "linux" - for Linux-specific features
   - "cross-platform" - for cross-platform features

2. For fullstack features, split them into separate frontend and backend features.
  use your own thinking to make a proper split

3. For platform, use these exact values:
   frontend, backend, ios, android, windows, macos, cross-platform-mobile, cross-platform-desktop, ai, fullstack

4. For complexity, use:
   simple, medium, complex

5. For phases, use:
   alpha, beta, production

Example Features:
For a fullstack authentication system:
1. Frontend Feature:
   {
     "title": "Authentication Components",
     "description": "Implement login, registration, and password reset forms with validation and error handling",
     "projectSide": "frontend",
     "platform": "frontend"
   }

2. Backend Feature:
   {
     "title": "Authentication API Endpoints",
     "description": "Create REST endpoints for user authentication, token management, and password reset",
     "projectSide": "backend",
     "platform": "backend"
   }
     
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

      console.log(data.object, "data.object");

      return NextResponse.json(data.object);
    } catch (error) {
      console.error("Error generating features:", error);
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
    console.error("Error in features AI route:", error);
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
