import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest) {
  const { idea, conversation = [], hasNoIdea = false } = await request.json();

  if (!idea) {
    return Response.json(
      {
        error: "Missing required fields",
        missingFields: { idea },
      },
      { status: 400 }
    );
  }

  const model = google("gemini-2.5-flash");

  // Build conversation context
  const conversationContext =
    conversation.length > 0
      ? `\n\nPrevious conversation:\n${conversation
          .map(
            (msg: any) => `${msg.role === "ai" ? "AI" : "User"}: ${msg.content}`
          )
          .join("\n")}`
      : "";

  // If user has no idea, help them through conversation
  if (hasNoIdea) {
    // Check if this is the first "no idea" response or part of ongoing conversation
    const isFirstNoIdeaResponse = conversation.length === 0;

    if (isFirstNoIdeaResponse) {
      // Start the discovery conversation
      return Response.json({
        needsMoreInfo: true,
        followUpQuestion:
          "No worries! Let's discover your perfect project together. What industry or field interests you most? Or is there a problem in your daily life that you wish had a better solution?",
        refinedIdea: null,
        readyToProceed: false,
        reasoning:
          "Starting discovery conversation to help user identify their business idea",
        suggestions: [
          {
            text: "mobile apps",
            description: "Explore building smartphone applications",
          },
          {
            text: "e-commerce",
            description: "Online selling and marketplace solutions",
          },
          {
            text: "productivity tools",
            description: "Help people work more efficiently",
          },
          {
            text: "social platforms",
            description: "Connect people and build communities",
          },
          {
            text: "daily life problems",
            description: "Solve everyday challenges people face",
          },
        ],
      });
    } else {
      // Continue the discovery conversation with AI guidance
      const response = await generateObject({
        model,
        schema: z.object({
          needsMoreInfo: z
            .boolean()
            .describe(
              "Whether more conversation is needed to clarify the idea"
            ),
          followUpQuestion: z
            .string()
            .optional()
            .describe("Next guiding question to help discover their idea"),
          refinedIdea: z
            .string()
            .optional()
            .describe("The discovered/refined idea if clear enough to proceed"),
          readyToProceed: z
            .boolean()
            .describe(
              "Whether we have enough clarity to move to project planning"
            ),
          reasoning: z.string().describe("Brief explanation of the decision"),
          suggestions: z
            .array(
              z.object({
                text: z
                  .string()
                  .describe("Short suggestion text to add to user input"),
                description: z
                  .string()
                  .describe(
                    "Brief explanation of what this suggestion helps with"
                  ),
              })
            )
            .optional()
            .describe("3-5 helpful suggestions to guide the user's thinking"),
        }),
        prompt: `You are a business strategist helping users transform ideas into viable products.

Current conversation with user:${conversationContext}

Your mission: Guide them to a clear, implementable business idea by gathering these REQUIRED elements:
1. TARGET AUDIENCE - Who exactly will use this?
2. CORE PROBLEM - What specific pain point does this solve?
3. SOLUTION APPROACH - How will your product solve it?
4. VALUE PROPOSITION - Why will people choose this over alternatives?

CONVERSATION STRATEGY:
- Ask ONE direct, business-focused question at a time
- If they sound uncertain, offer helpful suggestions to guide them
- When they mention something promising, immediately connect it to market opportunity
- If the user is persistent about their vision, acknowledge it and work with their preferences
- Be supportive and respect their direction while providing valuable guidance

QUESTION FORMAT: "To help you build a product that customers will actually pay for, I need to understand [specific aspect]. This will determine [business impact/implementation path]."

Examples:
- "Who specifically would use this? Understanding your target audience will help us design features they'll love and determine your marketing strategy."
- "What problem does this solve that people currently struggle with? This helps us validate market demand and pricing."

Once you have target audience + problem + solution approach, set readyToProceed to true.

IMPORTANT: If the user has repeatedly expressed the same preference or vision (e.g., wanting a "broad platform"), acknowledge their persistence and set readyToProceed to true to move forward with their vision.

For suggestions, provide market-validated options that move toward implementation:
- Specific customer segments with real pain points
- Proven business models in similar spaces
- Implementation approaches that reduce risk
- Market opportunities with clear demand

Be direct, supportive, and focused on turning their idea into a profitable product.`,
      });

      return response.toJsonResponse();
    }
  }

  // Normal flow for users who already have an idea
  const response = await generateObject({
    model,
    schema: z.object({
      needsMoreInfo: z
        .boolean()
        .describe("Whether the idea needs more clarification"),
      followUpQuestion: z
        .string()
        .optional()
        .describe("Follow-up question if more info is needed"),
      refinedIdea: z
        .string()
        .optional()
        .describe("The refined/clarified idea if ready to proceed"),
      readyToProceed: z
        .boolean()
        .describe(
          "Whether the idea is clear enough to proceed to project planning"
        ),
      reasoning: z.string().describe("Brief explanation of the decision"),
      suggestions: z
        .array(
          z.object({
            text: z
              .string()
              .describe("Short suggestion text to add to user input"),
            description: z
              .string()
              .describe("Brief explanation of what this suggestion helps with"),
          })
        )
        .optional()
        .describe(
          "3-5 helpful suggestions with descriptions to guide the user"
        ),
    }),
    prompt: `You are a business validation expert who transforms ideas into implementable product plans.

Your job: Analyze the user's idea and gather the REQUIRED information needed to create a comprehensive project roadmap for marketing, development, design, and business operations.

Current idea: "${idea}"${conversationContext}

VALIDATION CRITERIA - You need ALL of these to proceed:
1. TARGET AUDIENCE - Specific user segment (not "everyone")
2. CORE PROBLEM - Clear pain point this solves
3. SOLUTION APPROACH - How the product works
4. BUSINESS MODEL - How it makes money
5. KEY FEATURES - 2-3 essential functionalities

RESPONSE STRATEGY:
- If uncertain/vague responses: "I can see you're excited about this concept. To help you build something successful, could you help me understand [missing element]?"
- If user is persistent about their approach: "I understand your vision for [their approach]. Let's work with that and make it successful."
- Explain business impact when helpful: "Understanding [aspect] will help determine your [specific business outcome]"
- If user repeats their preference multiple times, accept it and proceed

QUESTION EXAMPLES with business reasoning:
- "Who exactly is your target customer? This determines your entire go-to-market strategy and feature priorities."
- "What specific problem does this solve? This validates market demand and helps price your product."
- "How will this make money? This shapes your development priorities and business sustainability."

APPROVAL CRITERIA: Proceed when you have target audience + problem + solution + business model clearly defined, OR when the user has consistently expressed their vision multiple times.

For suggestions, provide implementation-focused options:
- text: "subscription model", description: "Recurring revenue ensures business sustainability"
- text: "for remote teams", description: "Specific audience with proven willingness to pay"
- text: "solving communication gaps", description: "Clear problem with measurable business impact"

Limit to 3 follow-up questions maximum. Be direct, business-focused, and guide them toward profitable implementation.`,
  });

  return response.toJsonResponse();
}
