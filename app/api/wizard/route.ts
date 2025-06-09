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

  const model = google("gemini-2.5-flash-preview-04-17");

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
        followUpQuestion: "No worries! Let's discover your perfect project together. What industry or field interests you most? Or is there a problem in your daily life that you wish had a better solution?",
        refinedIdea: null,
        readyToProceed: false,
        reasoning: "Starting discovery conversation to help user identify their business idea",
        suggestions: [
          {
            text: "mobile apps",
            description: "Explore building smartphone applications"
          },
          {
            text: "e-commerce",
            description: "Online selling and marketplace solutions"
          },
          {
            text: "productivity tools",
            description: "Help people work more efficiently"
          },
          {
            text: "social platforms",
            description: "Connect people and build communities"
          },
          {
            text: "daily life problems",
            description: "Solve everyday challenges people face"
          }
        ]
      });
    } else {
      // Continue the discovery conversation with AI guidance
      const response = await generateObject({
        model,
        schema: z.object({
          needsMoreInfo: z
            .boolean()
            .describe("Whether more conversation is needed to clarify the idea"),
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
            .describe("Whether we have enough clarity to move to project planning"),
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
            .describe("3-5 helpful suggestions to guide the user's thinking")
        }),
        prompt: `You are a helpful business idea discovery assistant. The user initially said they had no idea for a project, and you're helping them discover what they want to build through conversation.

Current conversation with user:${conversationContext}

Your goal is to help them discover a viable business/project idea by:
1. Understanding their interests, skills, and passions
2. Identifying problems they've experienced or noticed
3. Exploring market opportunities they're curious about
4. Gradually building up to a concrete project idea

Guidelines for the conversation:
- Ask ONE specific, engaging question at a time
- Be encouraging and curious about their responses
- Help them connect their interests to potential projects
- Guide them toward identifying a specific problem and solution
- When they mention something interesting, dig deeper
- Once you have enough detail about their idea (target audience, problem, solution), approve it to proceed

If they've given enough information to form a clear project idea, set readyToProceed to true and provide a refinedIdea.

For suggestions, provide relevant options based on their responses that help them think deeper:
- If they mention an industry, suggest specific problems in that space
- If they mention skills, suggest how to apply them
- If they mention frustrations, suggest solutions
- Keep suggestions actionable and specific

Be conversational, supportive, and help them feel excited about their emerging idea!`
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
    prompt: `You are a super critical AI assistant that validates startup ideas and ensures they are clear enough for project planning.

Your job is to analyze the user's idea and determine if you have enough information to pass it to another AI that will generate a comprehensive project management plan across marketing, development, design, etc.

Current idea: "${idea}"${conversationContext}

Guidelines:
1. If the idea is vague, unclear, or missing key details (target audience, core features, problem being solved), ask ONE specific follow-up question
2. If the idea is clear and detailed enough, approve it to proceed
3. Focus on getting clarity on: target audience, core problem, key features, business model
4. Keep follow-up questions conversational and helpful
5. Don't ask more than 3 follow-up questions total
6. When asking for more info, provide 3-5 short, helpful suggestions that the user can click to add to their response

For suggestions, provide specific examples with descriptions like:
- text: "for busy professionals", description: "Helps define your target audience and user needs"
- text: "with real-time notifications", description: "Adds a key feature that enhances user engagement"
- text: "solving time management issues", description: "Clarifies the core problem your app addresses"
- text: "targeting millennials", description: "Specifies demographic for better market positioning"
- text: "subscription-based model", description: "Defines how your business will generate revenue"

Make suggestions relevant to what's missing from their idea. Keep descriptions under 15 words.

Be encouraging but thorough in your validation.`,
  });

  return response.toJsonResponse();
}
