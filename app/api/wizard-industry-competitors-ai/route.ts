import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { google } from "@ai-sdk/google";

const featureComparisonSchema = z.object({
  categories: z.array(
    z.object({
      name: z.string(),
      features: z.array(
        z.object({
          name: z.string(),
          description: z.string(),
          icon: z.string(), // lucide icon name
        })
      ),
    })
  ),
  competitors: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      type: z.enum([
        "Market Leader",
        "Innovative Startup",
        "Enterprise Solution",
        "Budget Option",
        "Niche Player",
      ]),
      description: z.string(),
      featureSupport: z.array(
        z.object({
          featureName: z.string(),
          hasFeature: z.boolean(),
        })
      ),
    })
  ),
  userProject: z.object({
    name: z.string(),
    featureSupport: z.array(
      z.object({
        featureName: z.string(),
        hasFeature: z.boolean(),
      })
    ),
  }),
});

export async function POST(request: Request) {
  try {
    let projectName, description, projectIdea;
    try {
      const body = await request.json();
      
      projectName = body.projectName;
      description = body.description;
      projectIdea = body.projectIdea;
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Handle both old structure (projectName + description) and new structure (projectIdea)
    let finalProjectName, finalDescription;

    if (projectIdea) {
      // New structure: single project idea
      finalProjectName = "Your Startup";
      finalDescription = projectIdea;
    } else if (projectName && description) {
      // Old structure: separate name and description
      finalProjectName = projectName || "Your Startup";
      finalDescription = description;
    } else {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missingFields: {
            projectIdea: !projectIdea,
            projectName: !projectName,
            description: !description,
          },
        },
        { status: 400 }
      );
    }

    // Add timestamp and unique identifier to prevent caching
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(7);

    const prompt = `[Analysis ID: ${uniqueId} | Timestamp: ${timestamp}]

SPECIFIC PROJECT ANALYSIS REQUEST:

Project Name: ${finalProjectName}
Project Description: "${finalDescription}"

CRITICAL INSTRUCTIONS:
- This analysis must be SPECIFIC to the exact project described above
- DO NOT use generic or template responses
- Base ALL features and competitors on the actual project description provided
- Generate a UNIQUE analysis that reflects the specific industry, target market, and functionality described

Create a feature comparison matrix with:

1. FEATURE CATEGORIES (3-4 categories specific to this project type)
   - Analyze the project description to identify the most relevant feature categories
   - Each category should have 2-3 features that are SPECIFIC to this project's domain
   - Total of 8-10 features across all categories
   - Features must be directly relevant to the project described above

2. COMPETITORS (4 real competitors specific to this project's market)
   - Research and identify actual companies that compete in this specific space
   - Include different types: Market Leader, Innovative Startup, Enterprise Solution, Budget Option
   - Competitors must be relevant to the exact project described
   - For each competitor, provide featureSupport array with featureName and hasFeature boolean

3. USER PROJECT ANALYSIS
   - Analyze what features THIS SPECIFIC project would realistically have
   - Consider the exact project description and its unique characteristics
   - Be honest about limitations for a new startup in this specific domain
   - Provide featureSupport array with featureName and hasFeature boolean

VALIDATION REQUIREMENTS:
- All features must be directly relevant to the project: "${finalDescription}"
- Competitors must operate in the same market space as this project
- Feature names in featureSupport arrays must exactly match category feature names
- Descriptions must be concise (under 100 characters each)
- Limit to 4 competitors and 8-10 features total

Remember: This analysis is for the specific project "${finalDescription}" - make it unique and relevant!`;

    const data = await generateObject({
      model: google("gemini-2.5-flash-preview-04-17"),
      prompt,
      schema: featureComparisonSchema,
      system: `You are a product analyst expert who creates detailed competitive feature matrices.

CRITICAL: You must create a UNIQUE analysis for each project. Never use generic templates or cached responses.

Your task is to:
1. Carefully read and understand the SPECIFIC project description provided
2. Identify feature categories that are DIRECTLY relevant to this project's domain
3. Select features that matter specifically for this type of project and its target market
4. Find real competitors that operate in the SAME market space as this project
5. Provide realistic assessments based on the project's specific characteristics

Guidelines for UNIQUE analysis:
- Features must be specific to the project's industry and functionality
- Competitors must be actual companies in the same market space
- Assessments must reflect what this specific project could realistically achieve
- Use domain-specific terminology and considerations
- Consider the project's target audience and use cases
- Provide lucide icon names relevant to the features (e.g., "smartphone", "globe", "shield", "users", "zap", "database", etc.)
- Ensure featureName in featureSupport arrays exactly matches the feature names in categories
- Each competitor and userProject must have featureSupport array with all features listed
- Keep descriptions under 100 characters but make them specific to this project
- Limit to 4 competitors maximum and 8-10 features total

AVOID:
- Generic "Platform Features" or "Basic Features" categories
- Generic competitors that don't match the project's market
- Template responses that could apply to any project
- Vague feature descriptions

ENSURE:
- Every feature is relevant to the specific project described
- Competitors are real companies in the same market
- Analysis reflects the unique aspects of this project`,
      temperature: 0.9, // Increased for more randomness
      maxTokens: 8000,
    });

    // Validate that we have complete data
    if (
      !data.object ||
      !data.object.categories ||
      !data.object.competitors ||
      !data.object.userProject
    ) {
      throw new Error("Incomplete data received from AI model");
    }

    // Transform the response to match the expected format
    const transformedData = {
      categories: data.object.categories,
      competitors: data.object.competitors.map((competitor) => ({
        ...competitor,
        features: competitor.featureSupport.reduce((acc, feature) => {
          acc[feature.featureName] = feature.hasFeature;
          return acc;
        }, {} as Record<string, boolean>),
      })),
      userProject: {
        name: data.object.userProject.name,
        features: data.object.userProject.featureSupport.reduce(
          (acc, feature) => {
            acc[feature.featureName] = feature.hasFeature;
            return acc;
          },
          {} as Record<string, boolean>
        ),
      },
    };

    return NextResponse.json(transformedData);
  } catch (error) {

    return NextResponse.json(
      {
        error: "Failed to analyze feature comparison",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
