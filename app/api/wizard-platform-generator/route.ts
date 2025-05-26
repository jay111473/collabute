import { NextRequest } from "next/server";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { generateObject } from "ai";

const platformSchema = z.object({
  frontendPlatforms: z.array(
    z.object({
      type: z.enum(["website", "ios", "android", "desktop", "pwa"]),
      isOptional: z.boolean(),
      priority: z.number().min(0).max(10),
      description: z.string(),
    })
  ),
  backendPlatforms: z.array(
    z.object({
      type: z.enum([
        "rest-api",
        "graphql-api",
        "database",
        "auth-service",
        "file-storage",
        "real-time",
        "ai-service",
        "payment-service",
      ]),
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
    prompt: `You are a Technical Product Manager. Your job is to generate separate lists of frontend and backend platforms for a project.

Project Title: ${title}
Project Description: ${description}

Generate appropriate platforms for both frontend and backend:

FRONTEND PLATFORMS:
- website: Web application accessible via browsers
- ios: Native iOS mobile application
- android: Native Android mobile application  
- desktop: Native desktop application (Windows/Mac/Linux)
- pwa: Progressive Web App with offline capabilities

BACKEND PLATFORMS:
- rest-api: RESTful API service
- graphql-api: GraphQL API service
- database: Database storage system
- auth-service: Authentication and authorization service
- file-storage: File upload and storage service
- real-time: Real-time communication (WebSocket, Server-Sent Events)
- ai-service: AI/ML integration and processing
- payment-service: Payment processing integration

Mark platforms as core (isOptional: false) only if the project absolutely cannot function without them. Most platforms should be optional unless they are fundamental to the core functionality.

Consider the project requirements carefully and suggest appropriate platforms with realistic priorities (1-10, where 10 is highest priority).`,
  });
  return response.toJsonResponse();
}
