import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { Competitor } from "@/types/wizard";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

interface ProjectPlatformInput {
  value: string;
  isCore?: boolean;
}
const platformEnum = z.enum([
  "web",
  "mobile",
  "desktop",
  "ai",
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

    // Create the schema with business-friendly structure
    const featureSchema = z.object({
      features: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          estimatedTimeline: z.string(),
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

    const prompt = `You are a product manager with deep understanding of software development. Generate user-focused, business-friendly features for a ${projectPlatforms
      .map((p: ProjectPlatformInput) => p.value)
      .join(", ")} project. Focus on creating a Minimum Viable Product (MVP) that delivers core business value.

Project Context:
Name: ${projectName}
Description: ${description}
Industries: ${industries.join(", ")}
Competitors: ${competitors.map((c: Competitor) => c.name).join(", ")}
Target Platforms: ${projectPlatforms
      .map((p: ProjectPlatformInput) => {
        // Map technical platforms to business-friendly terms
        const platformMap: Record<string, string> = {
          'frontend': 'web',
          'backend': 'web',
          'ios': 'mobile',
          'android': 'mobile',
          'windows': 'desktop',
          'macos': 'desktop',
          'cross-platform-mobile': 'mobile',
          'cross-platform-desktop': 'desktop',
          'ai': 'ai',
          'fullstack': 'web'
        };
        return platformMap[p.value] || p.value;
      })
      .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index) // Remove duplicates
      .join(", ")}
Scope: ${projectScope}

Generate at least 15 essential MVP features that will provide immediate business value and user benefit.

Important Guidelines:
1. Write feature descriptions in business language that stakeholders can understand
2. Focus on user value and business benefits
3. Avoid any technical terminology
4. Describe features from an end-user perspective
5. Use clear, simple language for timelines and complexity

For each feature, provide:
1. A clear, business-focused title
2. Description focusing on user benefits and business value
3. Realistic timeline estimate in weeks/months
4. Simple complexity indication (simple/medium/complex)

Remember:
- Focus on WHAT the feature does for users, not HOW it's implemented
- Use everyday business language
- Keep descriptions focused on value and outcomes
- Ensure features are essential for MVP launch
- Consider user journey and business goals`;

    try {
      const data = await generateObject({
        model: anthropic("claude-3-5-sonnet-20241022"),
        prompt,
        schema: featureSchema,
        system: `You are a product manager who translates business needs into clear feature descriptions. Your role is to generate MVP features that business stakeholders and end-users can easily understand.

Key Principles:
- Write for business stakeholders and end-users
- Focus on immediate business value and user benefits
- Use clear, jargon-free language
- Describe features in terms of user needs and business outcomes
- Focus on MVP essentials that deliver core value

When describing features:
- DO: "Enable customers to easily find and purchase products using simple search and filters"
- DON'T: "Implement elasticsearch with faceted search functionality"

Platform Guidelines:
- Web: Features for browser-based access
- Mobile: Features for smartphone/tablet users
- Desktop: Features for computer applications
- AI: Smart features that enhance user experience

Your responses must be valid JSON objects following the schema, but focus on business value and user benefits.

Timeline Guidance:
- Simple: 1-2 weeks
- Medium: 2-4 weeks
- Complex: 4-8 weeks`,
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
