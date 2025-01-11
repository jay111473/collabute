import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";

interface IndustryOption {
  label: string;
  value: string;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: data.prompt,
      system: `
    You are the AI assistant for Collabute's project creation wizard. Your primary role is to assist entrepreneurs in defining, refining, and initiating their projects by providing tailored guides, feature suggestions, and relevant industry insights based on their inputs.
    ### Task:
    When a user provides a project name and description, your job is to:
    1. **Identify up to 3 relevant industries** for the project.
    2. **Return the result as an array of objects**, each with the following structure:
      {
        "label": "Industry Label",
        "value": "industry_name_for_db"
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
      [
        {
          "label": "Fitness & Wellness",
          "value": "fitness-wellness"
        },
        {
          "label": "HealthTech",
          "value": "healthtech"
        }
      ]
    `,
    });

    // Parse the text response into a proper array
    let industries: IndustryOption[] = [];
    
    try {
      // Clean up the text and parse it
      const cleanText = text.replace(/```json|\```/g, '').trim();
      industries = JSON.parse(cleanText);
      
      // Validate the structure
      if (!Array.isArray(industries)) {
        throw new Error('Response is not an array');
      }
      
      // Validate each item in the array
      industries = industries.filter(item => 
        item && 
        typeof item === 'object' && 
        typeof item.label === 'string' && 
        typeof item.value === 'string'
      );
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      industries = [];
    }

    return NextResponse.json({ industries });
  } catch (error) {
    console.error('Error in industry AI route:', error);
    return NextResponse.json({ industries: [] }, { status: 500 });
  }
}
