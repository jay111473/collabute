import { NextRequest } from "next/server";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { generateObject } from "ai";

const platformSchema = z.object({
  platforms: z.array(
    z.object({
      type: z.enum(["website", "ios", "android", "desktop", "ai"]),
      isOptional: z.boolean(),
      priority: z.number().min(0).max(10),
      description: z.string(),
    })
  ),
});

export async function POST(request: NextRequest) {
  const { title, description } = await request.json();
  const model = google("gemini-2.5-flash-preview-04-17");
  const response = await generateObject({
    model,
    schema: platformSchema,
    prompt: `You are a Technical Product Manager.  Your job is to generate a list of platforms for a project with the following description: ${description} and title: ${title}. make sure you only mark platforms as core that this services cannot run without, otherwise it can be optional.`,
  });
  return response.toJsonResponse();
}
