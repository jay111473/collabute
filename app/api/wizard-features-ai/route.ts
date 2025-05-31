import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { Competitor } from "@/types/wizard";
import { z } from "zod";
import { google } from "@ai-sdk/google";

interface ProjectPlatformInput {
  value: string;
  isCore?: boolean;
}
const platformEnum = z.enum([
  "website", 
  "ios", 
  "android", 
  "desktop", 
  "pwa", 
  "rest-api", 
  "graphql-api", 
  "database", 
  "auth-service", 
  "file-storage", 
  "real-time", 
  "ai-service", 
  "payment-service"
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
    } = requestData;

    // Validate required fields
    if (
      !projectName ||
      !description ||
      !industries ||
      !competitors ||
      !projectPlatforms
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missingFields: {
            projectName: !projectName,
            description: !description,
            industries: !industries,
            competitors: !competitors,
            projectPlatforms: !projectPlatforms,
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
          platform: platformEnum,
          isCore: z.boolean(),
          order: z.number(),
        })
      ),
    });

    // Get unique platform values from projectPlatforms
    const platforms = projectPlatforms.map((p: ProjectPlatformInput) => p.value);
    
    const prompt = `You are a product manager with deep understanding of software development. Generate user-focused, business-friendly features for a project. Focus on creating a Minimum Viable Product (MVP) that delivers core business value.

Project Context:
Name: ${projectName}
Description: ${description}
Industries: ${industries.join(", ")}
Competitors: ${competitors.map((c: Competitor) => c.name).join(", ")}
Target Platforms: ${platforms.join(", ")}

Generate at least 15 essential MVP features that will provide immediate business value and user benefit.

Important Guidelines:
1. Write feature descriptions in business language that stakeholders can understand
2. Focus on user value and business benefits
3. Avoid any technical terminology
4. Describe features from an end-user perspective
5. Clearly identify if a feature is core (must-have) or optional
6. Assign an implementation order number to each feature based on technical dependencies

For each feature, provide:
1. A clear, business-focused title
2. Description focusing on user benefits and business value
3. Platform the feature belongs to (choose from: ${platforms.join(", ")})
4. Indicate if the feature is core (true) or optional (false)
5. Assign an implementation order number (starting from 1) based on technical dependencies and logical implementation sequence

Remember:
- Focus on WHAT the feature does for users, not HOW it's implemented
- Use everyday business language
- Keep descriptions focused on value and outcomes
- Ensure features are essential for MVP launch
- Consider user journey and business goals
- About 1/3 of your features should be marked as core features
- Core features should generally have lower order numbers (implemented first)
- Features with technical dependencies should come after their prerequisites`;

    try {
      const data = await generateObject({
        model: google("gemini-2.5-flash-preview-04-17"),
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

For each feature, assign it to one of these platforms based on where the feature would primarily be used:

FRONTEND PLATFORMS:
- website: Web application features accessible via browsers
- ios: Native iOS mobile application features
- android: Native Android mobile application features
- desktop: Native desktop application features
- pwa: Progressive Web App features with offline capabilities

BACKEND PLATFORMS:
- rest-api: RESTful API service features
- graphql-api: GraphQL API service features
- database: Database storage and data management features
- auth-service: Authentication and authorization features
- file-storage: File upload and storage features
- real-time: Real-time communication features (WebSocket, Server-Sent Events)
- ai-service: AI/ML integration and processing features
- payment-service: Payment processing and transaction features

Available platforms for this project: ${platforms.join(", ")}

Mark approximately 1/3 of the features as core (isCore: true) - these are absolutely essential for the MVP and cannot be removed.
The remaining features should be marked as optional (isCore: false) - these enhance the product but aren't strictly necessary for the first version.

Assign an implementation order number to each feature:
- Order numbers should start at 1 and be sequential
- Core features should generally have lower order numbers (implemented first)
- Consider technical dependencies (e.g., user authentication must be implemented before user profiles)
- For each platform, there should be a logical implementation sequence
- Authentication, basic data models, and core infrastructure should have the lowest order numbers
- Features building upon those foundations should have higher numbers
- Most complex or specialized features should have the highest numbers

Your responses must be valid JSON objects following the schema, but focus on business value and user benefits.`,
        temperature: 1,
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
