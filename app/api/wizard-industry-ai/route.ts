import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { z } from "zod";

interface IndustryOption {
  label: string;
  value: string;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const industrySchema = z.object({
      industries: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
        })
      ),
    });

    const { object } = await generateObject({
      model: bedrock("anthropic.claude-3-5-sonnet-20240620-v1:0"),
      prompt: data.prompt,
      schema: industrySchema,
      system: `
    You are the AI assistant for Collabute's project creation wizard. Your primary role is to assist entrepreneurs in defining, refining, and initiating their projects by providing tailored guides, feature suggestions, and relevant industry insights based on their inputs.
    ### Task:
    When a user provides a project name and description, your job is to:
    1. **Identify up to 3 relevant industries** for the project.
    2. **Return the result as an object with an industries array**, with the following structure:
      {
        "industries": [
          {
            "label": "Industry Label",
            "value": "industry_name_for_db"
          }
        ]
      }
    ### Guidelines:
    - The **"label"** should be a clear, user-friendly industry name (e.g., "E-commerce," "Healthcare," "EdTech").
    - The **"value"** should be a lowercase, hyphenated string designed for database storage (e.g., "e-commerce," "healthcare," "edtech").
    - Select **up to 3 industries** based on the project description. If only 1 or 2 are relevant, return fewer.
    - Prioritize the most **specific and relevant** industries first.

    ### Example Inputs and Outputs:
    1. **Input:**
      - Project Name: "FitCoach"
      - Description: "An AI-powered fitness app offering personalized workout plans and nutrition advice."
      **Output:**
      {
        "industries": [
          {
            "label": "Fitness & Wellness",
            "value": "fitness-wellness"
          },
          {
            "label": "HealthTech",
            "value": "healthtech"
          }
        ]
      }
    `,
    });

    return NextResponse.json({ industries: object.industries });
  } catch (error) {
    return NextResponse.json({ industries: [] }, { status: 500 });
  }
}
