import { generateObject } from "ai";
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { NextResponse } from "next/server";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";

const competitorSchema = z.object({
  competitors: z.array(z.object({
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
  }))
});

export async function POST(request: Request) {
  try {
    const { projectName, description, industries, industry } = await request.json();

    // Validate required fields
    if (!projectName || !description || !industry) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missingFields: {
            projectName: !projectName,
            description: !description,
            industry: !industry,
          },
        },
        { status: 400 }
      );
    }

    const prompt = `Analyze the market and identify key competitors for this project:

Project Name: ${projectName}
Description: ${description}
Industry: ${industry}
Additional Industries: ${industries.join(', ')}

For each competitor, provide:
1. Company name
2. Website URL
3. Company slogan or tagline
4. Year founded
5. Business scale (Startup, SMB, Enterprise, or Global Enterprise)
6. Market share and region (if applicable)
7. Brief description of their offering

Focus on direct competitors in the same market space. Include both established players and notable startups.
Ensure the data is accurate and up-to-date.`;

    const data = await generateObject({
      model: openai("gpt-4o-mini"),
      prompt,
      schema: competitorSchema,
      system: `You are a market research expert with deep knowledge of various industries and competitors.
      Provide accurate competitor analysis with real company data.
      Include a mix of established companies and innovative startups.
      Focus on direct competitors in the same market space.
      For each competitor, provide comprehensive details including their slogan, founding year, business scale, and market position.`,
      temperature: 0.7,
      maxTokens: 2000,
    });

    return NextResponse.json(data.object);
  } catch (error) {
    console.error("Competitor analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze competitors" },
      { status: 500 }
    );
  }
}
