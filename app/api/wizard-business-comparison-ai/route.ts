import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { google } from "@ai-sdk/google";

const businessComparisonSchema = z.object({
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
      businessSupport: z.array(
        z.object({
          businessAspect: z.string(),
          hasAspect: z.boolean(),
        })
      ),
    })
  ),
  userProject: z.object({
    name: z.string(),
    businessSupport: z.array(
      z.object({
        businessAspect: z.string(),
        hasAspect: z.boolean(),
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

    const prompt = `[Business Analysis ID: ${uniqueId} | Timestamp: ${timestamp}]

SPECIFIC BUSINESS MODEL ANALYSIS REQUEST:

Project Name: ${finalProjectName}
Project Description: "${finalDescription}"

CRITICAL INSTRUCTIONS:
- This business analysis must be SPECIFIC to the exact project described above
- DO NOT use generic business model templates
- Base ALL business aspects and competitors on the actual project description provided
- Generate a UNIQUE business analysis that reflects the specific industry, market, and business model described

Create a business comparison matrix with:

1. BUSINESS CATEGORIES (3-4 categories specific to this project's business model)
   - Analyze the project description to identify the most relevant business aspects
   - Each category should have 2-3 business aspects that are SPECIFIC to this project's domain
   - Total of 8-10 business aspects across all categories
   - Business aspects must be directly relevant to the project described above

2. COMPETITORS (4 real competitors specific to this project's market)
   - Research and identify actual companies that compete in this specific business space
   - Include different types: Market Leader, Innovative Startup, Enterprise Solution, Budget Option
   - Competitors must be relevant to the exact project and business model described
   - For each competitor, provide businessSupport array with businessAspect and hasAspect boolean

3. USER PROJECT BUSINESS ANALYSIS
   - Analyze what business capabilities THIS SPECIFIC project would realistically have
   - Consider the exact project description and its unique business characteristics
   - Be honest about business limitations for a new startup in this specific domain
   - Provide businessSupport array with businessAspect and hasAspect boolean

VALIDATION REQUIREMENTS:
- All business aspects must be directly relevant to the project: "${finalDescription}"
- Competitors must operate in the same business space as this project
- Business aspect names in businessSupport arrays must exactly match category business aspect names
- Descriptions must be concise (under 100 characters each)
- Limit to 4 competitors and 8-10 business aspects total

Remember: This business analysis is for the specific project "${finalDescription}" - make it unique and relevant to this business model!`;

    const data = await generateObject({
      model: google("gemini-2.5-flash-preview-04-17"),
      // model: openai("gpt-4o"),
      prompt,
      schema: businessComparisonSchema,
      system: `You are a business strategy expert who creates detailed competitive business model analyses.

CRITICAL: You must create a UNIQUE business analysis for each project. Never use generic business templates or cached responses.

Your task is to:
1. Carefully read and understand the SPECIFIC project description provided
2. Identify business categories that are DIRECTLY relevant to this project's business model
3. Select business aspects that matter specifically for this type of project and its market
4. Find real competitors that operate in the SAME business space as this project
5. Provide realistic business assessments based on the project's specific characteristics

Guidelines for UNIQUE business analysis:
- Business aspects must be specific to the project's industry and business model
- Competitors must be actual companies in the same business space
- Assessments must reflect what this specific project could realistically achieve from a business perspective
- Use domain-specific business terminology and considerations
- Consider the project's target market and business model
- Provide lucide icon names relevant to the business aspects (e.g., "dollar-sign", "users", "globe", "trending-up", "shield", "headphones", etc.)
- Ensure businessAspect in businessSupport arrays exactly matches the business aspect names in categories
- Each competitor and userProject must have businessSupport array with all business aspects listed
- Keep descriptions under 100 characters but make them specific to this project's business model
- Limit to 4 competitors maximum and 8-10 business aspects total

AVOID:
- Generic "Revenue Model" or "Basic Business" categories
- Generic competitors that don't match the project's business space
- Template business responses that could apply to any project
- Vague business descriptions

ENSURE:
- Every business aspect is relevant to the specific project described
- Competitors are real companies in the same business market
- Analysis reflects the unique business aspects of this project
- Focus on business strategy differences, not technical implementation`,
      temperature: 0.9,
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
        features: competitor.businessSupport.reduce((acc, business) => {
          acc[business.businessAspect] = business.hasAspect;
          return acc;
        }, {} as Record<string, boolean>),
      })),
      userProject: {
        name: data.object.userProject.name,
        features: data.object.userProject.businessSupport.reduce(
          (acc, business) => {
            acc[business.businessAspect] = business.hasAspect;
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
        error: "Failed to analyze business comparison",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
