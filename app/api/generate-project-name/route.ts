import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { google } from "@ai-sdk/google";

const projectNameSchema = z.object({
  projectName: z.string().describe("A concise, professional project name (2-4 words max)"),
  reasoning: z.string().describe("Brief explanation of why this name was chosen"),
  alternatives: z.array(z.string()).describe("2-3 alternative name suggestions"),
});

export async function POST(request: Request) {
  try {
    const { projectIdea } = await request.json();

    if (!projectIdea) {
      return NextResponse.json(
        { error: "Missing required field: projectIdea" },
        { status: 400 }
      );
    }

    const prompt = `Generate a professional, marketable project name for this business idea:

"${projectIdea}"

REQUIREMENTS:
- 2-4 words maximum
- Professional and brandable
- Easy to remember and pronounce
- Reflects the core value proposition
- Suitable for a startup/business
- Avoid generic terms like "app", "platform", "solution"
- Make it sound innovative but credible

EXAMPLES of good naming:
- "TaskFlow" for a project management tool
- "MealCraft" for a recipe planning service
- "CodeBridge" for a developer collaboration platform
- "GreenPath" for a sustainability tracking app

Consider the target audience, industry, and unique selling proposition when creating the name.`;

    const data = await generateObject({
      model: google("gemini-2.5-flash"),
      prompt,
      schema: projectNameSchema,
      system: `You are a professional brand naming expert who creates memorable, marketable business names.

Your task is to:
1. Analyze the project idea to understand its core value proposition
2. Identify the target audience and industry context
3. Create a name that is brandable, professional, and memorable
4. Ensure the name reflects what the business actually does
5. Avoid generic or overly technical terms

Guidelines:
- Keep it short (2-4 words max)
- Make it easy to spell and pronounce
- Ensure it's brandable and professional
- Reflect the core benefit or solution
- Consider how it would look as a logo or domain name
- Think about international appeal and pronunciation`,
      temperature: 0.8,
      maxTokens: 1000,
    });

    if (!data.object?.projectName) {
      throw new Error("Failed to generate project name");
    }

    return NextResponse.json(data.object);
  } catch (error) {
    console.error("Error generating project name:", error);
    return NextResponse.json(
      {
        error: "Failed to generate project name",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}