import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { ProjectSide } from "@/types/wizard";

interface ProjectPlatformInput {
  value: string;
  isCore?: boolean;
}

export async function POST(request: Request) {
  try {
    const { projectName, description, industries, competitors, projectPlatforms, projectScope } =
      await request.json() as {
        projectName: string;
        description: string;
        industries: string[];
        competitors: { name: string; url: string }[];
        projectPlatforms: ProjectPlatformInput[];
        projectScope: string;
      };

    // Determine which project sides we need features for
    const projectSides = getProjectSides(projectPlatforms.map(p => p.value));

    const prompt = `
      Generate a comprehensive list of essential features for this project:
      Project: ${projectName}
      Description: ${description}
      Industries: ${industries.join(", ")}
      Competitors: ${competitors.map(c => c.name).join(", ")}
      Project Platforms: ${projectPlatforms.map(p => p.value).join(", ")}
      Project Scope: ${projectScope}

      Requirements:
      - Generate features for these project sides: ${projectSides.join(", ")}
      - For each project side, generate at least:
        * 10-15 core features in alpha phase (MVP)
        * 8-10 enhancement features in beta phase
        * 5-8 advanced features in production phase
      - Each feature must have:
        * Clear title (max 50 chars)
        * Brief description
        * Realistic timeline (3-7 days for simple, 1-2 weeks for medium, 2-4 weeks for complex)
        * Price (30% below market - simple: $200-500, medium: $500-1000, complex: $1000-3000)
        * Phase (alpha for core MVP, beta for enhancements, production for advanced)
        * Complexity (low/medium/high)
        * Project side (${projectSides.join(" | ")})
      - Features should cover:
        * Core functionality
        * User experience and interface
        * Performance and optimization
        * Security and data protection
        * Integration and connectivity
        * Monitoring and analytics
        * Administration and management
        * Customization and configuration
      ${projectPlatforms.some(p => p.value === 'fullstack') ? `
      - For fullstack:
        * Frontend features should focus on UI/UX, client-side logic, state management, and user interactions
        * Backend features should focus on APIs, data management, server logic, and system architecture
        * Include features that show frontend-backend integration
        * Consider scalability, performance, and security features
      ` : ''}
      ${projectPlatforms.some(p => p.value === 'frontend') ? `
      - For frontend:
        * UI components and layouts
        * State management and data flow
        * User interactions and animations
        * Responsive design and accessibility
        * Performance optimization
        * Error handling and feedback
        * Client-side validation
        * Progressive enhancement
      ` : ''}
      ${projectPlatforms.some(p => p.value === 'backend') ? `
      - For backend:
        * API endpoints and documentation
        * Database design and optimization
        * Authentication and authorization
        * Data validation and sanitization
        * Caching and performance
        * Security measures
        * Logging and monitoring
        * Background jobs and scheduling
      ` : ''}
      ${projectPlatforms.some(p => p.value === 'ios' || p.value === 'android') ? `
      - For mobile (${projectPlatforms.some(p => p.value === 'ios') ? 'iOS' : 'Android'}):
        * Native UI components and layouts
        * Offline functionality and data sync
        * Push notifications and deep linking
        * Device permissions and features
        * Performance optimization
        * Security and data protection
        * App lifecycle management
        * Platform-specific guidelines
      ` : ''}
      ${projectPlatforms.some(p => p.value === 'cross-platform-mobile') ? `
      - For cross-platform mobile:
        * Shared business logic
        * Platform-specific adaptations
        * Native feature integration
        * Performance optimization
        * Code sharing strategy
        * Platform-specific UI/UX
        * Testing and quality assurance
        * Deployment and updates
      ` : ''}
      ${projectPlatforms.some(p => p.value === 'windows' || p.value === 'macos') ? `
      - For desktop (${projectPlatforms.filter(p => ['windows', 'macos'].includes(p.value)).map(p => p.value).join(' & ')}):
        * Native UI components
        * System integration
        * File system operations
        * Auto-updates and installation
        * Performance optimization
        * Security features
        * Offline capabilities
        * Hardware integration
      ` : ''}
      ${projectPlatforms.some(p => p.value === 'cross-platform-desktop') ? `
      - For cross-platform desktop:
        * Consistent UI across platforms
        * Platform-specific integrations
        * Resource management
        * Update mechanism
        * Installation process
        * Native feature access
        * Performance optimization
        * Security measures
      ` : ''}

      Respond with ONLY a valid JSON object in this exact format:
      {
        "features": [
          {
            "title": "Feature Name",
            "description": "Feature description",
            "estimatedTimeline": "2 weeks",
            "estimatedPrice": 1000,
            "phase": "alpha",
            "complexity": "medium",
            "projectSide": "frontend"
          }
        ]
      }

      Do not include any other text or explanation in your response, only the JSON object.`;

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      system: `You are a feature planning assistant specializing in ${projectPlatforms.map(p => p.value).join(', ')} projects. Your responses must be valid JSON objects only, no additional text. Always include all required fields for each feature. Ensure prices are 30% below market rates and timelines are realistic. Organize features by project side and development phase.`,
      temperature: 0.7,
      maxTokens: 4000,
    });

    try {
      // Sanitize the response to ensure it's valid JSON
      const sanitizedText = text.trim()
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/^\s*[\r\n]/gm, '');

      const parsedFeatures = JSON.parse(sanitizedText);

      // Validate the structure of the response
      if (!parsedFeatures.features || !Array.isArray(parsedFeatures.features)) {
        throw new Error('Invalid features structure in response');
      }

      // Ensure each feature has all required fields
      parsedFeatures.features = parsedFeatures.features.map((feature: {
        title?: string;
        description?: string;
        estimatedTimeline?: string;
        estimatedPrice?: number;
        phase?: 'alpha' | 'beta' | 'production';
        complexity?: 'low' | 'medium' | 'high';
        projectSide?: string;
      }) => ({
        title: feature.title || 'Untitled Feature',
        description: feature.description || 'No description provided',
        estimatedTimeline: feature.estimatedTimeline || '1 week',
        estimatedPrice: feature.estimatedPrice || 500,
        phase: feature.phase || 'alpha',
        complexity: feature.complexity || 'medium',
        projectSide: feature.projectSide || projectSides[0]
      }));

      return NextResponse.json(parsedFeatures);
    } catch (error) {
      console.error('Error parsing features response:', error);
      console.error('Raw text:', text);
      
      return NextResponse.json(
        { error: 'Failed to generate features. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in features AI route:", error);
    return NextResponse.json(
      { error: "Failed to generate features" },
      { status: 500 }
    );
  }
}

function getProjectSides(projectPlatforms: string[]): ProjectSide[] {
  const sides = new Set<ProjectSide>();
  
  projectPlatforms.forEach(platform => {
    switch (platform) {
      case 'fullstack':
        sides.add('frontend');
        sides.add('backend');
        break;
      case 'frontend':
        sides.add('frontend');
        break;
      case 'backend':
        sides.add('backend');
        break;
      case 'ios':
        sides.add('ios');
        sides.add('backend');
        break;
      case 'android':
        sides.add('android');
        sides.add('backend');
        break;
      case 'cross-platform-mobile':
        sides.add('cross-platform');
        sides.add('backend');
        break;
      case 'windows':
        sides.add('windows');
        sides.add('backend');
        break;
      case 'macos':
        sides.add('macos');
        sides.add('backend');
        break;
      case 'cross-platform-desktop':
        sides.add('cross-platform');
        sides.add('backend');
        break;
      case 'ai':
        sides.add('ai');
        sides.add('backend');
        sides.add('frontend');
        break;
    }
  });

  return Array.from(sides);
}

function getDefaultProjectSide(projectPlatforms: string[]): ProjectSide {
  const platform = projectPlatforms[0];
  switch (platform) {
    case 'frontend':
      return 'frontend';
    case 'backend':
      return 'backend';
    case 'ios':
      return 'ios';
    case 'android':
      return 'android';
    case 'windows':
      return 'windows';
    case 'macos':
      return 'macos';
    case 'cross-platform-mobile':
    case 'cross-platform-desktop':
      return 'cross-platform';
    case 'ai':
      return 'ai';
    default:
      return 'frontend';
  }
}
