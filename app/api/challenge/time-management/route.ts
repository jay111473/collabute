import { generateObject } from "ai";
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { NextResponse } from "next/server";
import { z } from "zod";

const timeManagementSchema = z.object({
  scenario: z.object({
    context: z.string(),
    question: z.string(),
    options: z.array(z.object({
      id: z.string(),
      text: z.string(),
      analysis: z.object({
        style: z.enum(["agile", "structured", "flexible", "deadline-driven"]),
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        recommendation: z.string()
      })
    }))
  })
});

// Simple rate limiting
const REQUESTS = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();

    // Check rate limit
    const clientRequests = REQUESTS.get(ip) || { count: 0, resetTime: now + RATE_WINDOW };
    
    if (now > clientRequests.resetTime) {
      // Reset window
      clientRequests.count = 1;
      clientRequests.resetTime = now + RATE_WINDOW;
    } else if (clientRequests.count >= RATE_LIMIT) {
      // Rate limited
      const retryAfter = Math.ceil((clientRequests.resetTime - now) / 1000);
      return new NextResponse(
        JSON.stringify({ error: "Too many requests" }),
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      clientRequests.count++;
    }
    
    REQUESTS.set(ip, clientRequests);

    const { languages, categories } = await request.json();

    const prompt = `Generate a time management scenario for a developer with the following context:
    Primary Language(s): ${languages.join(', ')}
    Industry Focus: ${categories.join(', ')}

    Create a realistic scenario that tests the developer's ability to handle time-sensitive decisions in software development.
    The scenario should be specific to their technical background and industry focus.
    Each option should represent a different time management approach.

    The scenario should involve:
    1. A complex technical challenge in their chosen industry
    2. Multiple stakeholders with different priorities
    3. Tight deadlines and resource constraints
    4. Technical debt considerations
    5. Team collaboration aspects

    For each option, provide:
    1. A clear action plan
    2. Analysis of the approach (strengths and weaknesses)
    3. Long-term implications
    4. Team impact considerations

    Make the scenario highly specific to their industry. For example:
    - For FinTech: Include financial compliance deadlines
    - For HealthTech: Include patient data security considerations
    - For E-commerce: Include peak traffic periods
    - For Blockchain: Include network upgrade timelines`;

    const data = await generateObject({
      model: bedrock("anthropic.claude-3-5-sonnet-20240620-v1:0"),
      prompt,
      schema: timeManagementSchema,
      system: `You are an expert technical project manager with deep understanding of software development processes.
      Generate realistic time management scenarios that test a developer's decision-making abilities.
      Focus on real-world situations they might encounter in their specific technical domain.
      Each option should represent a valid but different approach to time management.
      Make the scenarios highly specific to the developer's chosen industry and technical stack.`,
      temperature: 0.7,
      maxTokens: 2000,
    });

    return NextResponse.json(data.object);
  } catch (error) {
    console.error("Time management challenge generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate time management scenario" },
      { status: 500 }
    );
  }
} 