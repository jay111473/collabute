import { NextResponse } from "next/server";
import { z } from "zod";
import { generateAIResponse } from "@/lib/utils/ai";

const technicalChallengeSchema = z.object({
  challenge: z.object({
    title: z.string(),
    difficulty: z.enum(["easy", "medium", "hard"]),
    timeEstimate: z.number(),
    context: z.string(),
    requirements: z.array(z.string()),
    codeTemplate: z.object({
      language: z.string(),
      template: z.string(),
      emptySection: z.object({
        startLine: z.number(),
        endLine: z.number(),
        description: z.string()
      })
    }),
    testCases: z.array(z.object({
      input: z.string(),
      expectedOutput: z.string(),
      description: z.string()
    })),
    hints: z.array(z.string()),
    evaluation: z.object({
      criteria: z.array(z.string()),
      scoringRubric: z.array(z.object({
        aspect: z.string(),
        points: z.number(),
        description: z.string()
      }))
    })
  })
});

export async function POST(request: Request) {
  try {
    const { languages, categories, timeManagementStyle } = await request.json();

    const prompt = `Generate a coding challenge for a developer with the following context:
    Primary Language: ${languages[0]}
    Industry Focus: ${categories.join(', ')}
    Time Management Style: ${timeManagementStyle}

    Create a practical coding challenge that:
    1. Uses real-world scenarios from their selected industry
    2. Tests their knowledge of ${languages[0]}
    3. Matches their time management style (${timeManagementStyle})
    4. Has clear evaluation criteria
    5. Provides helpful test cases

    The challenge should:
    - Be solvable within 30 minutes
    - Focus on practical problem-solving
    - Be specific to their industry (${categories[0]})
    - Include industry-specific requirements
    - Have clear test cases with inputs and expected outputs
    - Include helpful hints that guide without giving away the solution

    Make the challenge highly specific to their industry. For example:
    - For FinTech: Transaction processing, financial calculations
    - For HealthTech: Patient data handling, medical record processing
    - For E-commerce: Cart calculations, inventory management
    - For Blockchain: Smart contract logic, transaction validation
    
    The code template should include:
    1. Necessary imports and setup
    2. Function signature
    3. Clear comments explaining the task
    4. Placeholder for their implementation
    5. Example usage

    The test cases should cover:
    1. Basic functionality
    2. Edge cases
    3. Industry-specific scenarios
    4. Error handling requirements`;

    const systemPrompt = `You are a senior technical interviewer with expertise in multiple programming languages.
      Generate practical coding challenges that test real-world development skills.
      Focus on industry-relevant problems that demonstrate both technical knowledge and problem-solving ability.
      Ensure the challenge is appropriate for the developer's background and industry focus.
      Create clear, testable requirements and helpful test cases.
      The code template should be syntactically correct for the chosen language.`;

    const cacheKey = `technical:${languages[0]}:${categories.join(',')}:${timeManagementStyle}`;

    const data = await generateAIResponse({
      prompt,
      schema: technicalChallengeSchema,
      cacheKey,
      systemPrompt,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Technical challenge generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate technical challenge" },
      { status: 500 }
    );
  }
} 