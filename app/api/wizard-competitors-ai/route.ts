import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";

interface Competitor {
  name: string;
  description: string;
  website: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received request body:", body);

    const { projectName, description, industry, industries } = body;
    
    // Handle both single industry or industries array
    const primaryIndustry = industry || (Array.isArray(industries) ? industries[0] : undefined);
    
    console.log("Extracted fields:", {
      projectName,
      description,
      primaryIndustry,
      hasProjectName: !!projectName,
      hasDescription: !!description,
      hasPrimaryIndustry: !!primaryIndustry
    });

    if (!projectName || !description || !primaryIndustry) {
      const missingFields = [
        !projectName && "projectName",
        !description && "description",
        !primaryIndustry && "industry/industries",
      ].filter(Boolean);

      return NextResponse.json(
        { 
          error: "Missing required fields", 
          missingFields,
          receivedData: body 
        },
        { status: 400 }
      );
    }

    const prompt = `
      Please analyze and identify competitors for the following project:
      Project Name: ${projectName}
      Description: ${description}
      Primary Industry: ${primaryIndustry}
      ${industries ? `Related Industries: ${industries.slice(1).join(', ')}` : ''}

      Please provide a list of 5 main competitors in this space, focusing primarily on the ${primaryIndustry} sector.
    `;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      system: `
        You are an AI assistant for competitor analysis. Your task is to identify potential competitors for a given project based on its name, description, and industry.
        
        Provide the result as a valid JSON array of competitor objects. Each competitor should have:
        - name: The company/product name
        - description: A brief (max 150 chars) description
        - website: The main website URL
        
        Example output format:
        [
          {
            "name": "CompetitorName",
            "description": "Brief description of what they do",
            "website": "https://example.com"
          }
        ]
        
        Keep responses focused on direct competitors in the same space. Ensure all URLs are valid and descriptions are concise.
      `,
    });

    try {
      const competitors: Competitor[] = JSON.parse(text);
      
      // Sanitize and validate the response
      const sanitizedCompetitors = competitors
        .slice(0, 5) // Limit to 5 competitors
        .map(comp => ({
          name: comp.name?.trim() || "Unknown",
          description: comp.description?.slice(0, 150)?.trim() || "No description available",
          website: comp.website?.trim() || "#"
        }));

      return NextResponse.json({ competitors: sanitizedCompetitors });
    } catch (parseError) {
      console.error("Error parsing competitors response:", parseError);
      return NextResponse.json(
        { error: "Failed to process competitors data" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in competitors AI route:", error);
    return NextResponse.json(
      { error: "Failed to analyze competitors" },
      { status: 500 }
    );
  }
}
