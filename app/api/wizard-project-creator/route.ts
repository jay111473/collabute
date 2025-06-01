import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";

const generatedProjectSchema = z.object({
  name: z.string(),
  platform: z.string(),
  framework: z.string(),
  language: z.string(),
  estimatedTimeline: z.string(),
});

const projectsResponseSchema = z.object({
  projects: z.array(generatedProjectSchema),
});

export async function POST(request: NextRequest) {
  const { 
    projectName, 
    description, 
    projectPlatforms, 
    industries 
  } = await request.json();

  if (!projectName || !description || !projectPlatforms || projectPlatforms.length === 0) {
    return Response.json({ 
      error: "Missing required fields", 
      missingFields: { projectName, description, projectPlatforms } 
    }, { status: 400 });
  }

  const model = google("gemini-2.5-flash-preview-04-17");
  
  const platformsList = projectPlatforms.map((p: any) => p.value).join(', ');
  const industriesList = industries?.join(', ') || 'general';

  const response = await generateObject({
    model,
    schema: projectsResponseSchema,
    prompt: `You are a Technical Product Manager at a software development marketplace. Break down this project into separate development projects that paid developers can work on quickly.

Project Details:
- Name: ${projectName}
- Description: ${description}
- Target Platforms: ${platformsList}
- Industries: ${industriesList}

For each selected platform, create a focused development project with:
1. **name**: Clear project name (e.g., "E-commerce Frontend", "User Management API")
2. **platform**: The type of project (e.g., "Frontend Application", "Backend API", "iOS App", "Android App")
3. **framework**: Recommended framework/technology (e.g., "React", "Node.js", "Swift", "Flutter")
4. **language**: Programming language (e.g., "TypeScript", "JavaScript", "Swift", "Kotlin")
5. **estimatedTimeline**: Realistic timeline considering this is paid open-source work (fast but fair - e.g., "2-3 weeks", "1 month", "6 weeks")

Examples:
- Frontend platform → "React" framework, "TypeScript" language, "3-4 weeks" timeline
- Backend platform → "Node.js" framework, "TypeScript" language, "4-5 weeks" timeline  
- iOS platform → "SwiftUI" framework, "Swift" language, "5-6 weeks" timeline

Keep it simple and practical. Generate 2-5 projects maximum based on the selected platforms.`,
  });

  return response.toJsonResponse();
}
