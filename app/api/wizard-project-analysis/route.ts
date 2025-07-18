import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";

const projectAnalysisSchema = z.object({
  projectName: z.string().describe("A refined project name based on the repository content"),
  projectDescription: z.string().describe("A comprehensive description of what the project does"),
  overview: z.string().describe("A detailed overview of the project's purpose and goals"),
  technologyStack: z.array(z.string()).describe("List of technologies, frameworks, and tools used"),
  projectType: z.enum(["web-app", "mobile-app", "desktop-app", "api", "library", "cli-tool", "other"]).describe("Type of project"),
  keyFeatures: z.array(z.string()).describe("Main features and capabilities of the project"),
  architecture: z.string().describe("Brief description of the project's architecture"),
  setupInstructions: z.string().describe("How to set up and run the project"),
  apiEndpoints: z.array(z.object({
    path: z.string(),
    method: z.string(),
    description: z.string()
  })).optional().describe("API endpoints if it's a backend project"),
  dependencies: z.array(z.object({
    name: z.string(),
    purpose: z.string()
  })).describe("Key dependencies and their purposes"),
  complexity: z.enum(["beginner", "intermediate", "advanced"]).describe("Project complexity level"),
  developmentStatus: z.enum(["early-stage", "active-development", "stable", "maintenance"]).describe("Current development status"),
  targetAudience: z.string().describe("Who this project is for"),
  codeQuality: z.object({
    hasTests: z.boolean(),
    hasDocumentation: z.boolean(),
    hasLinting: z.boolean(),
    hasTypeScript: z.boolean(),
    score: z.number().min(1).max(10).describe("Overall code quality score")
  }).describe("Code quality assessment"),
  recommendations: z.array(z.string()).describe("Suggestions for improvement or next steps")
});

export async function POST(request: NextRequest) {
  try {
    const { readme, packageJson, repoStructure, codeFiles } = await request.json();
    
    const model = google("gemini-2.5-flash-preview-04-17");
    
    const analysisPrompt = `You are a Senior Technical Product Manager and Code Architect. Analyze this repository and provide comprehensive insights.

Repository Content:
${readme ? `README.md:\n${readme}\n\n` : ''}
${packageJson ? `package.json:\n${packageJson}\n\n` : ''}
${repoStructure ? `Repository Structure:\n${repoStructure}\n\n` : ''}
${codeFiles ? `Code Files Sample:\n${codeFiles}\n\n` : ''}

Please analyze this repository and provide:
1. A refined project name and comprehensive description
2. Detailed overview of the project's purpose and goals
3. Complete technology stack analysis
4. Key features and capabilities
5. Architecture insights
6. Setup instructions
7. API endpoints (if applicable)
8. Dependencies analysis
9. Complexity assessment
10. Development status
11. Target audience
12. Code quality assessment
13. Recommendations for improvement

Be thorough, professional, and provide actionable insights that would help a development team understand and work with this project.`;

    const response = await generateObject({
      model,
      schema: projectAnalysisSchema,
      prompt: analysisPrompt,
    });

    return response.toJsonResponse();
  } catch (error) {
    console.error("Error analyzing repository:", error);
    return Response.json(
      { error: "Failed to analyze repository" },
      { status: 500 }
    );
  }
}