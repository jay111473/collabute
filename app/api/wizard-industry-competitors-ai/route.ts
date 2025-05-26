import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { z } from "zod";

const industryCompetitorSchema = z.object({
  industries: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ),
  competitors: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      slogan: z.string().optional(),
      yearFounded: z.number().optional(),
      businessScale: z.enum(['Startup', 'SMB', 'Enterprise', 'Global Enterprise']).optional(),
      marketShare: z.object({
        percentage: z.number(),
        region: z.string()
      }).optional(),
      description: z.string().optional()
    })
  )
});

export async function POST(request: Request) {
  try {
    const { projectName, description } = await request.json();

    // Validate required fields
    if (!projectName || !description) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missingFields: {
            projectName: !projectName,
            description: !description,
          },
        },
        { status: 400 }
      );
    }

    const prompt = `Analyze this project and provide both industry classification and competitor analysis:

Project Name: ${projectName}
Description: ${description}

Please provide:

1. INDUSTRIES: Identify up to 3 most relevant industries for this project
2. COMPETITORS: Find 5-8 key competitors in the identified industries

For industries, provide:
- Clear, user-friendly industry names (e.g., "E-commerce," "Healthcare," "EdTech")
- Database-friendly values (lowercase, hyphenated: "e-commerce," "healthcare," "edtech")

For competitors, provide:
- Company name and website URL
- Company slogan or tagline
- Year founded
- Business scale (Startup, SMB, Enterprise, or Global Enterprise)
- Market share and region (if applicable)
- Brief description of their offering

Focus on direct competitors in the same market space. Include both established players and notable startups.
Ensure the data is accurate and up-to-date.`;

    const data = await generateObject({
      model: openai("gpt-4o-mini"),
      prompt,
      schema: industryCompetitorSchema,
      system: `You are a market research expert with deep knowledge of various industries and competitors.
      
      Your task is to:
      1. Classify the project into the most relevant industries (up to 3)
      2. Identify key competitors in those industries
      
      For industry classification:
      - Be specific and relevant
      - Use clear, professional industry names
      - Prioritize the most specific industries first
      
      For competitor analysis:
      - Provide accurate competitor data with real company information
      - Include a mix of established companies and innovative startups
      - Focus on direct competitors in the same market space
      - Provide comprehensive details for each competitor`,
      temperature: 0.7,
      maxTokens: 3000,
    });

    return NextResponse.json(data.object);
  } catch (error) {
    console.error("Industry and competitor analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze industries and competitors" },
      { status: 500 }
    );
  }
} 