import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";

const projectSchema = z.object({
  projectDescription: z.string(),
  projectName: z.string(),
});

export async function POST(request: NextRequest) {
  const { readme, packageJson } = await request.json();
  const model = google("gemini-2.5-flash");
  const response = await generateObject({
    model,
    schema: projectSchema,
    prompt: `You are a Technical Product Manager. your job is to describe the project based on its readme file content and package json file content.`,
  });
  return response.toJsonResponse();
}
